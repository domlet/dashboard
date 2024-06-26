const calendarIds = [
  "ccpaedu.com_ftu0la54kio0crhh83m267lri8@group.calendar.google.com", // CCPA
  "en.usa#holiday@group.v.calendar.google.com", // US observances
  "hhm0o0t2uqmmm0dsjg9t5n7uk0nnspe4@import.calendar.google.com", // UN observances
  "398cuok6nh0gpq8ild25ros54qmlrabf@import.calendar.google.com", // culture_awareness
  "1g09kltmldcsn4bmpkdvg97k5v5apl6u@import.calendar.google.com", // holidays_funny
  "", // Zodiac
];
let combinedEvents = [];
// Function to fetch events from Google Calendar
$(document).ready(function () {
  async function fetchGoogleCalendarEvents() {
    const calendarId =
      "ccpaedu.com_ftu0la54kio0crhh83m267lri8@group.calendar.google.com";
    // Set 'timeMin' to control the school year to pull events from
    const timeMin = "2024-08-01T00:00:00Z";
    const gCalkey = "AIzaSyDdvMUXW8jaNxCfVZQv3vKbaL4nTzhygMI";
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin}&key=${gCalkey}`;
    const response = await fetch(url);
    const gCaldata = await response.json();
    const gCalevents = gCaldata.items;
    // Remove events with no start date
    gCalActiveEvents = gCalevents.filter((item) => item.status !== "cancelled");
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
        item.summary.search("playoffs") != -1
      ) {
        item.eventType = "studentActivity";
      } else {
        item.eventType = "event";
      }
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
  // Call the function to fetch events from Google Calendar
  fetchGoogleCalendarEvents()
    .then((gCalActiveEvents) => {
      const datesOrdered = (function () {
        for (let event of currentSY.dates) {
          combinedEvents.push(event);
        }
        for (let event of gCalActiveEvents) {
          combinedEvents.push(event);
        }
        // Sort by start date
        combinedEvents.sort((a, b) => a.beg - b.beg);
        console.log(combinedEvents.length);
        showEvents(combinedEvents);
        return combinedEvents;
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
