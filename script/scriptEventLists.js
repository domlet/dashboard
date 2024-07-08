const calendarIds = [
  "ccpaedu.com_ftu0la54kio0crhh83m267lri8@group.calendar.google.com", // CCPA
  "a71ff6b63e1709ae2bfbcada2b3b64ebeb1f7f5e30787b2bb059725fa17b7b2b@group.calendar.google.com", // Opportunities HS - https://github.com/ccpa-ousd/opps-cal-hs
];
let combinedGCalEvents = [];
let combinedAllEvents = [];
// Function to fetch events from Google Calendar
$(document).ready(function () {
  async function fetchGoogleCalendarEvents(calendarIdsList) {
    // Set 'timeMin' to control the school year to pull events from
    const timeMin = "2024-08-01T00:00:00Z"; // set for SY2425
    const gCalkey = "AIzaSyDdvMUXW8jaNxCfVZQv3vKbaL4nTzhygMI"; // https://console.cloud.google.com/apis/credentials/
    // for each of the calendars, get valid events and reformat them.
    for (let i = 0; i < calendarIdsList.length; i++) {
      let calendarId = calendarIdsList[i];
      let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin}&key=${gCalkey}`;
      let response = await fetch(url);
      let gCaldata = await response.json();
      let gCalevents = gCaldata.items;
      let gCalActiveEvents = [];
      // Remove events with no start date
      gCalActiveEvents = gCalevents.filter(
        (item) => item.status !== "cancelled"
      );

      // push each event (from each calendar) into the combinedGCalEvents array
      for (let i = 0; i < gCalActiveEvents.length; i++) {
        if (
          calendarId ==
          "a71ff6b63e1709ae2bfbcada2b3b64ebeb1f7f5e30787b2bb059725fa17b7b2b@group.calendar.google.com"
        ) {
          gCalActiveEvents[i].eventType = "opportunity";
        }
        combinedGCalEvents.push(gCalActiveEvents[i]);
      }
    }
    // Format the object the same way as the SY objects
    return combinedGCalEvents.map((item) => {
      const startDate = new Date(item.start.dateTime || item.start.date);
      const endDate = new Date(item.end.dateTime || item.end.date);
      return {
        beg: startDate,
        end: endDate,
        name: item.summary,
        description: item.location || item.description || "",
        eventType: item.eventType || "",
      };
    });
  }

  /*
  if the promise is good...
  */
  fetchGoogleCalendarEvents(calendarIds)
    .then((combinedGCalEvents) => {
      // Assign event types
      for (item of combinedGCalEvents) {
        if (
          item.name.search("No School") != -1 ||
          item.name.search("Holiday") != -1
        ) {
          item.eventType = "studentHoliday";
        } else if (item.eventType == "opportunity") {
          // if it's an opportunity calendar it was already set
          item.eventType = "opportunity";
        } else if (
          item.name.search("vs") != -1 ||
          item.name.search("ball") != -1 ||
          item.name.search("Track") != -1 ||
          item.name.search("Soccer") != -1 ||
          item.name.search("Futsol") != -1 ||
          item.name.search("Robotics") != -1 ||
          item.name.search("Esports") != -1 ||
          item.name.search("playoffs") != -1
        ) {
          item.eventType = "studentActivity";
        } else {
          item.eventType = "event";
        }
      }
      // get items from both gCals and hard-coded cals
      // and combine them into one array
      // then sort them by date
      const datesOrdered = (function () {
        for (let event of currentSY.dates) {
          combinedAllEvents.push(event);
        }
        for (let event of combinedGCalEvents) {
          combinedAllEvents.push(event);
        }
        // Sort by start date
        combinedAllEvents.sort((a, b) => a.beg - b.beg);
        showEvents(combinedAllEvents);
        return combinedAllEvents;
      })();
    })
    .catch((error) => {
      console.error("Error fetching events:", error);
    });
});

// Show upcoming events on the page
function showEvents(eventsArray) {
  // modify formatting of the events
  for (let i = 0; i < eventsArray.length; i++) {
    if (eventsArray[i].description != "") {
      // remove html in descriptions
      eventsArray[i].description = eventsArray[i].description.replace(
        /<[^>]*>/g,
        ""
      );
      // add spaces after '.' (except .com...)
      eventsArray[i].description = eventsArray[i].description.replace(
        /\.(?!\s|co\b|org\b|net\b)/g,
        ". "
      );
      // add spaces after ':' (except '://')
      eventsArray[i].description = eventsArray[i].description.replace(
        /\:(?!\s|\/\/\b)/g,
        ": "
      );
    }
    // truncate any long titles or desc
    if (eventsArray[i].name.length > 17) {
      eventsArray[i].name = eventsArray[i].name.substring(0, 17) + "..";
    }
    if (eventsArray[i].description.length > 100) {
      eventsArray[i].description = eventsArray[i].description.substring(0, 100);
    }
  }
  // separate the events into arrays by type
  let eHoliday = [];
  let eStudAct = [];
  let eEvent = [];
  let eOpps = [];
  for (i in eventsArray) {
    // Collect only future events
    if (eventsArray[i].end > dateToday) {
      // Collect future holidays:
      if (eventsArray[i].eventType == "studentHoliday") {
        eHoliday.push(eventsArray[i]);
      } else if (eventsArray[i].eventType == "event") {
        // Collect future non-holidays:
        eEvent.push(eventsArray[i]);
      } else if (eventsArray[i].eventType == "opportunity") {
        // Collect future opps:
        eOpps.push(eventsArray[i]);
      } else {
        eStudAct.push(eventsArray[i]);
      }
    }
  }
  // Display upcoming events (of all types):
  let textHolidays = "";
  let textEvents = "";
  let textStudActs = "";
  let textOpps = "";

  for (x in eHoliday) {
    textHolidays +=
      "<li class='event-item'><strong>" + eHoliday[x].name + " </strong>";
    textHolidays +=
      "<span class='event-date'>" +
      eHoliday[x].beg.toLocaleString("en-US", {
        weekday: "short",
        month: "numeric",
        day: "numeric",
      }) +
      "</span></li>";
  }
  for (y in eEvent) {
    textEvents +=
      "<li class='event-item'><strong>" + eEvent[y].name + " </strong>";

    textEvents +=
      "<span class='event-date'>" +
      eEvent[y].beg.toLocaleString("en-US", {
        weekday: "short",
        month: "numeric",
        day: "numeric",
      }) +
      "</span><br><p class='event-item-desc py-0'>" +
      eEvent[y].description +
      "</p></li>";
  }
  for (z in eStudAct) {
    textStudActs +=
      "<li class='event-item'><strong>" + eStudAct[z].name + " </strong>";
    textStudActs +=
      "<span class='event-date'>" +
      eStudAct[z].beg.toLocaleString("en-US", {
        weekday: "short",
        month: "numeric",
        day: "numeric",
      }) +
      "</span><br><p class='event-item-desc py-0'>" +
      eStudAct[z].description +
      "</p></li>";
  }
  for (aa in eOpps) {
    textOpps +=
      "<li class='event-item'><strong>" + eOpps[aa].name + " </strong>";
    textOpps +=
      "<span class='event-date'>" +
      eOpps[aa].beg.toLocaleString("en-US", {
        weekday: "short",
        month: "numeric",
        day: "numeric",
      }) +
      "</span><br><p class='event-item-desc py-0'>" +
      eOpps[aa].description +
      "</p></li>";
  }
  document.getElementById("events-student-holiday").innerHTML = textHolidays;
  document.getElementById("events-student-activities").innerHTML = textStudActs;
  document.getElementById("events-student-non-holiday").innerHTML = textEvents;
  document.getElementById("events-student-opps").innerHTML = textOpps;
}
// Calendar show/hide onclick:
let calendarIsVisible = null;
let iframeHtml =
  "<div id='showHideCal'><iframe src='https://calendar.google.com/calendar/embed?&wkst=2&bgcolor=%23ffffff&ctz=America%2FLos_Angeles&src=Y2NwYWVkdS5jb21fZnR1MGxhNTRraW8wY3JoaDgzbTI2N2xyaThAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&color=%23EF6C00&amp;mode=AGENDA' style='border:0' width='300' height='400' frameborder='0' scrolling='yes'></iframe></div>";
let gCalContainer = document.createElement("div");
gCalContainer.style.display = "none";
gCalContainer.setAttribute("id", "gCalContainer");
document.body.appendChild(gCalContainer);
gCalContainer.innerHTML = iframeHtml;
function showGoogleCalendar() {
  if (calendarIsVisible == true) {
    gCalContainer.style.display = "none";
    calendarIsVisible = false;
  } else {
    gCalContainer.style.display = "block";
    calendarIsVisible = true;
  }
}
