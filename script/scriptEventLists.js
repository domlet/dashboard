const calendarIds = [
  "ccpaedu.com_ftu0la54kio0crhh83m267lri8@group.calendar.google.com", // CCPA
  "a71ff6b63e1709ae2bfbcada2b3b64ebeb1f7f5e30787b2bb059725fa17b7b2b@group.calendar.google.com", // Opportunities HS - https://github.com/ccpa-ousd/opps-cal-hs
  "en.usa#holiday@group.v.calendar.google.com", // US observances
  "hhm0o0t2uqmmm0dsjg9t5n7uk0nnspe4@import.calendar.google.com", // UN observances
  "398cuok6nh0gpq8ild25ros54qmlrabf@import.calendar.google.com", // culture_awareness
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
      console.log(calendarIdsList.length + " calendars here");
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
      console.log(
        "Cal " + i + " has " + gCalActiveEvents.length + " active events."
      );
      // Assign event types
      for (let item of gCalActiveEvents) {
        if (
          item.summary.search("No School") != -1 ||
          item.summary.search("Holiday") != -1
        ) {
          item.eventType = "studentHoliday";
        } else if (
          item.summary.search("vs") != -1 ||
          item.summary.search("ball") != -1 ||
          item.summary.search("Track") != -1 ||
          item.summary.search("Soccer") != -1 ||
          item.summary.search("Futsol") != -1 ||
          item.summary.search("Robotics") != -1 ||
          item.summary.search("Esports") != -1 ||
          item.summary.search("playoffs") != -1
        ) {
          item.eventType = "studentActivity";
        } else {
          item.eventType = "event";
        }
        console.log(gCalActiveEvents.length + " gCalActiveEvents");
      }
      // Format the object the same way as the SY objects
      return gCalActiveEvents.map((item) => {
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
  }

  /*
  Call the function to fetch events from all calendarIds
  and also the hard-coded currentSY object
  and combine them into one array of events
  */
  fetchGoogleCalendarEvents(calendarIds)
    .then((gCalActiveEvents) => {
      const datesOrdered = (function () {
        for (let event of currentSY.dates) {
          combinedAllEvents.push(event);
        }
        for (let event of gCalActiveEvents) {
          combinedAllEvents.push(event);
        }
        // Sort by start date
        combinedAllEvents.sort((a, b) => a.beg - b.beg);
        console.log(
          "there are now " + combinedAllEvents.length + " combinedAllEvents"
        );
        showEvents(combinedAllEvents);
        return combinedAllEvents;
      })();
    })
    .catch((error) => {
      console.error("Error fetching events:", error);
    });
});

function showEvents(eventsArray) {
  // Show upcoming events:
  let eHoliday = [];
  let eEvent = [];
  let eStudAct = [];
  let textHolidays = "";
  let textEvents = "";
  let textStudActs = "";
  // Collect only future events:
  for (i in eventsArray) {
    if (eventsArray[i].beg > dateToday) {
      // Collect future holidays:
      if (eventsArray[i].eventType == "studentHoliday") {
        eHoliday.push(eventsArray[i]);
      } else if (eventsArray[i].eventType == "event") {
        // Collect future non-holidays:
        eEvent.push(eventsArray[i]);
      } else {
        eStudAct.push(eventsArray[i]);
      }
    }
  }
  // Display upcoming events (of both types):
  for (x in eHoliday) {
    if (eHoliday[x].name.length > 18) {
      textHolidays +=
        "<li class='event-item'><strong>" +
        eHoliday[x].name.substring(0, 18) +
        ".. </strong>";
    } else {
      textHolidays +=
        "<li class='event-item'><strong>" + eHoliday[x].name + " </strong>";
    }
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
    if (eEvent[y].name.length > 18) {
      textEvents +=
        "<li class='event-item'><strong>" +
        eEvent[y].name.substring(0, 18) +
        ".. </strong>";
    } else {
      textEvents +=
        "<li class='event-item'><strong>" + eEvent[y].name + " </strong>";
    }
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
    if (eStudAct[z].name.length > 18) {
      textStudActs +=
        "<li class='event-item'><strong>" +
        eStudAct[z].name.substring(0, 18) +
        ".. </strong>";
    } else {
      textStudActs +=
        "<li class='event-item'><strong>" + eStudAct[z].name + " </strong>";
    }
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
  document.getElementById("events-student-holiday").innerHTML = textHolidays;
  document.getElementById("events-student-activities").innerHTML = textStudActs;
  document.getElementById("events-student-non-holiday").innerHTML = textEvents;
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
