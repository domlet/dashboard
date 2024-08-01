/*
Scripts specific to events, ie not dots
*/

// const { addDays } = require("date-fns");

const calendarIds = [
  "ccpaedu.com_ftu0la54kio0crhh83m267lri8@group.calendar.google.com", // CCPA
  "a71ff6b63e1709ae2bfbcada2b3b64ebeb1f7f5e30787b2bb059725fa17b7b2b@group.calendar.google.com", // Free museums - https://github.com/ccpa-ousd/opps-cal-hs
  "e5c502978d4582e2e7b304e8197120672739ed245f730fc938e64c24949e000e@group.calendar.google.com", // CCPA Dashboard Cal
];
let combinedGCalEvents = [];
let combinedAllEvents = [];

// Fetch events from Google Calendar
document.addEventListener("DOMContentLoaded", () => {
  async function fetchGoogleCalendarEvents(calendarIdsList) {
    // Set parameters for Google Calendar API
    const now = new Date(); // today's date
    // const now = new Date("January 01, 2025"); // fake date (for testing purposes)
    const timeMin = now.toISOString();
    let timeMax = "";
    // date-fns stuff
    if (window.dateFns && window.dateFns.addDays) {
      const { addDays } = window.dateFns;
      timeMax = addDays(now, 90);
      timeMax = timeMax.toISOString();
    } else {
      console.error("dateFns or addDays is not available.");
    }

    const timezone = "America/Los_Angeles";
    const gCalkey = "AIzaSyDdvMUXW8jaNxCfVZQv3vKbaL4nTzhygMI"; // https://console.cloud.google.com/apis/credentials/

    // for each calendar, get all events
    console.log("Grabbing " + calendarIds.length + " GCals...");
    for (let i = 0; i < calendarIdsList.length; i++) {
      let calendarId = calendarIdsList[i];
      let url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}&key=${gCalkey}&timeZone=${timezone}`;
      let response = await fetch(url); // gets a response object
      let gCaldata = await response.json(); // converts to JSON
      let gCalevents = gCaldata.items; // gets just the items array

      // in the same loop, fetch recurring instances
      // and set eventType for calendars like 'opportunity'
      for (let event of gCalevents) {
        if (event.recurrence) {
          let instancesUrl = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${event.id}/instances?timeMin=${timeMin}&timeMax=${timeMax}&key=${gCalkey}&timeZone=${timezone}`;
          let instancesResponse = await fetch(instancesUrl);
          let instancesData = await instancesResponse.json();
          let instances = instancesData.items;
          for (let event of instances) {
            event.eventType = "opportunity";
          }
          combinedGCalEvents.push(...instances);
        } else {
          combinedGCalEvents.push(event);
        }
      }
      console.log(gCalevents.length + " events in GCal #" + i);

      // Remove events with no start date
      let gCalActiveEvents = [];
      gCalActiveEvents = gCalevents.filter(
        (item) => item.status !== "cancelled"
      );
      // Adjust for CCPA Public Calendar events which are missing timezones and dateTimes
      // That missing data causes its events to show up 1 day early
      for (item of combinedGCalEvents) {
        if (
          calendarId ==
            "ccpaedu.com_ftu0la54kio0crhh83m267lri8@group.calendar.google.com" &&
          item.start.timeZone != "America/Los_Angeles" &&
          item.start.dateTime == undefined
        ) {
          item.start.timeZone = "America/Los_Angeles";
          item.start.dateTime = item.start.date + " 0:00:00";
        }
      }
      // push each event (from each calendar) into the combinedGCalEvents array
      for (let i = 0; i < gCalActiveEvents.length; i++) {
        if (
          calendarId ==
          "a71ff6b63e1709ae2bfbcada2b3b64ebeb1f7f5e30787b2bb059725fa17b7b2b@group.calendar.google.com"
        ) {
          gCalActiveEvents[i].eventType = "opportunity";
        } else if (
          calendarId ==
          "e5c502978d4582e2e7b304e8197120672739ed245f730fc938e64c24949e000e@group.calendar.google.com"
        ) {
          gCalevents[i].eventType = "studentActivity";
        }

        combinedGCalEvents.push(gCalActiveEvents[i]);
      }
    }
    // Format the event the same way as the SY events
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
          item.name.search("Cross Country") != -1 ||
          item.name.search("XC") != -1 ||
          item.name.search("Soccer") != -1 ||
          item.name.search("Futsol") != -1 ||
          item.name.search("Robotics") != -1 ||
          item.name.search("Esports") != -1 ||
          item.name.search("Track") != -1 ||
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
      for (let event of currentSY.dates) {
        combinedAllEvents.push(event);
      }
      for (let event of combinedGCalEvents) {
        combinedAllEvents.push(event);
      }
      // Sort by start date
      combinedAllEvents.sort((a, b) => a.beg - b.beg);
      // remove duplicates
      for (let i = 0; i < combinedAllEvents.length - 1; i++) {
        if (combinedAllEvents[i].name == combinedAllEvents[i + 1].name) {
          combinedAllEvents.splice(i, 1);
        }
      }
      showEvents(combinedAllEvents);
      return combinedAllEvents;
    })
    .catch((error) => {
      console.error("Error fetching events:", error);
    });
});

// Function to convert URLs to linked HTML text
function convertUrlsToLinks(text) {
  // Regular expression to find URLs
  var urlPattern = /(https?:\/\/[^\s]+)/g;

  // Replace URLs with HTML links
  var newText = text.replace(
    urlPattern,
    '<a href="$1" target="_blank" class="item-link">Learn more</a>.'
  );

  return newText;
}

// Show upcoming events on the page
function showEvents(eventsArray) {
  // modify formatting of the events
  for (let i = 0; i < eventsArray.length; i++) {
    if (eventsArray[i].description != "") {
      // remove html in descriptions; use ' ' for padding
      eventsArray[i].description = eventsArray[i].description.replace(
        /<[^>]*>/g,
        " "
      );
      // convert urls to links
      eventsArray[i].description = convertUrlsToLinks(
        eventsArray[i].description
      );
      // add spaces after ':' (except '://')
      eventsArray[i].description = eventsArray[i].description.replace(
        /\:(?!\s|\/\/\b)/g,
        ": "
      );
      // remove double spaces
      eventsArray[i].description = eventsArray[i].description.replace(
        /\s\s/g,
        " "
      );
    }
    // truncate any long titles or desc
    if (eventsArray[i].name.length > 17) {
      eventsArray[i].name = eventsArray[i].name.substring(0, 17) + "..";
    }
    if (eventsArray[i].description.length > 160) {
      eventsArray[i].description =
        eventsArray[i].description.substring(0, 160) + "...";
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
  console.log("- eHoliday (" + eHoliday.length + " events)");
  console.log("- eStudAct (" + eStudAct.length + " events)");
  console.log("- eEvent (" + eEvent.length + " events)");
  console.log("- eOpps (" + eOpps.length + " events)");

  // Display upcoming events (of all types):
  let textHolidays = "";
  let textEvents = "";
  let textStudActs = "";
  let textOpps = "";

  for (x in eHoliday) {
    textHolidays +=
      "<li class='list-item'><strong>" + eHoliday[x].name + " </strong>";
    textHolidays +=
      "<span class='item-bubble'>" +
      eHoliday[x].beg.toLocaleString("en-US", {
        weekday: "short",
        month: "numeric",
        day: "numeric",
      }) +
      "</span></li>";
  }
  for (y in eEvent) {
    textEvents +=
      "<li class='list-item'><strong>" + eEvent[y].name + " </strong>";

    textEvents +=
      "<span class='item-bubble'>" +
      eEvent[y].beg.toLocaleString("en-US", {
        weekday: "short",
        month: "numeric",
        day: "numeric",
      }) +
      "</span><br><p class='list-item-desc py-0'>" +
      eEvent[y].description +
      "</p></li>";
  }
  for (z in eStudAct) {
    textStudActs +=
      "<li class='list-item'><strong>" + eStudAct[z].name + " </strong>";
    textStudActs +=
      "<span class='item-bubble'>" +
      eStudAct[z].beg.toLocaleString("en-US", {
        weekday: "short",
        month: "numeric",
        day: "numeric",
      }) +
      "</span><br><p class='list-item-desc py-0'>" +
      eStudAct[z].description +
      "</p></li>";
  }
  for (aa in eOpps) {
    textOpps +=
      "<li class='list-item'><strong>" + eOpps[aa].name + " </strong>";
    textOpps +=
      "<span class='item-bubble'>" +
      eOpps[aa].beg.toLocaleString("en-US", {
        weekday: "short",
        month: "numeric",
        day: "numeric",
      }) +
      "</span><br><p class='list-item-desc py-0'>" +
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
