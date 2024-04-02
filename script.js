// Define School Years and Terms:
const currentSY = SY2324; // Set the current school year.
const nextSY = SY2324; // Set the current school year.
// Define today and date options
const dateToday = new Date();
const dateOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};
const datePretty = dateToday.toLocaleString("en-US", dateOptions);
// Array of currentSY dates sorted chronologically:
const datesOrdered = (function () {
  let dates = [];
  for (i in currentSY.dates) {
    dates.push(currentSY.dates[i]);
  }
  dates.sort((a, b) => a.beg - b.beg);
  return dates;
})();
console.log(datesOrdered);
function dateDiffInDays(a, b) {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

function calculateSY(schoolYear) {
  yearStart = schoolYear.terms[1].beg; // Get T1 beg date
  yearEnd = schoolYear.terms[schoolYear.terms.length - 2].end; // Get T4 end date
  daysTotal = Math.floor((yearEnd - yearStart) / (1000 * 3600 * 24));
  daysElapsed = Math.floor((dateToday - yearStart) / (1000 * 3600 * 24));
  daysElapsedPercent = Math.floor((daysElapsed / daysTotal) * 100);
  // don't show negative percent, like '-4%'
  if (daysElapsedPercent < 0) {
    daysElapsedPercent = 0;
  }
  daysRemainYear = Math.floor(daysTotal - daysElapsed);
  daysUntilNextSY = dateDiffInDays(dateToday, nextSY.terms[0].beg);
  return;
}
calculateSY(currentSY);

// Calculate the terms:

let currentTerm = {};
let termDaysTotal = "";
let termDaysElapsed = "";
let termDaysRemain = "";
let termPercentComplete = "";
// This function looks at all terms for the current SY
function calculateTerms(termsList) {
  for (let i = 0; i < termsList.length; i++) {
    // Always calculate total days:
    termDaysTotal = Math.floor(
      (termsList[i].end - termsList[i].beg) / (1000 * 3600 * 24)
    );
    termsList[i].termDaysTotal = termDaysTotal;
    // Terms that have ended:
    if (dateToday > termsList[i].end) {
      termsList[i].termDaysElapsed = termDaysTotal;
      termsList[i].termDaysRemain = 0;
      termsList[i].termPercentComplete = 100;
      // Terms that haven't started:
    } else if (dateToday < termsList[i].beg) {
      termsList[i].termDaysElapsed = 0;
      termsList[i].termDaysRemain = termDaysTotal;
      termsList[i].termPercentComplete = 0;
      // Current term:
    } else {
      termsList[i].termDaysElapsed = Math.floor(
        (dateToday - termsList[i].beg) / (1000 * 3600 * 24) + 1
      );
      termsList[i].termDaysRemain = Math.floor(
        termDaysTotal - termsList[i].termDaysElapsed
      );
      termsList[i].termPercentComplete = Math.floor(
        (termsList[i].termDaysElapsed / termDaysTotal) * 100
      );
      currentTerm = termsList[i];
    }
    // Update the 'allterms' object:
    termsList[i].percentcomplete = termPercentComplete;
    console.log(
      "" +
        termsList[i].termName +
        ": " +
        termsList[i].termDaysElapsed +
        "/" +
        termsList[i].termDaysTotal +
        " days (" +
        termsList[i].termPercentComplete +
        "%); " +
        termsList[i].termDaysRemain +
        " remain."
    );
  }
  return;
}
// Call the function:
calculateTerms(currentSY.terms);
let dotsEmptyHtml = [];
let dotsFilledHtml = [];
function drawDots(schoolYear) {
  let dotsHtml = "";
  // Do this for each term...
  for (let i = 0; i < schoolYear.terms.length; i++) {
    // 6 terms
    // Draw filled dots (for elapsed days)
    dotsHtml = "";
    for (let x = 0; x < schoolYear.terms[i].termDaysElapsed; x++) {
      let date = schoolYear.terms[i].beg;
      let dateCute = date.toLocaleString("en-US", {
        weekday: "short",
        month: "numeric",
        day: "numeric",
      }); // Tooltip
      dotsHtml += `<div class='dot filled-dot' title='${dateCute}' ></div>`;
      date.setDate(date.getDate() + 1); // Increment the date
    }
    dotsEmptyHtml.push(dotsHtml);
    // Draw empty dots (for remaining days)
    dotsHtml = "";
    for (let y = 0; y < schoolYear.terms[i].termDaysRemain + 1; y++) {
      let date = schoolYear.terms[i].beg;
      let dateCute = date.toLocaleString("en-US", {
        weekday: "short",
        month: "numeric",
        day: "numeric",
      }); // Tooltip
      dotsHtml += `<div class='dot empty-dot' title='${dateCute}' ></div>`;
      date.setDate(date.getDate() + 1); // Increment the date
    }
    dotsFilledHtml.push(dotsHtml);
  }
}
drawDots(currentSY);
function showStuff() {
  // Generate written summaries and HTML to display them:
  document.getElementById("dateSpan").innerHTML =
    "<strong>" + datePretty + "</strong>";
  if (daysElapsedPercent <= 100) {
    document.getElementById("daysElapsedPercent").innerHTML =
      "We have completed " +
      daysElapsedPercent +
      "% of the <strong>" +
      currentSY.schoolyear +
      "</strong> school year.";
  } else {
    document.getElementById("daysElapsedPercent").innerHTML =
      "The <strong>" +
      currentSY.schoolyear +
      "</strong> school year is almost finished.";
  }
  document.getElementById("currentTerm").innerHTML =
    "We are in <strong>" +
    currentTerm.termName +
    "</strong> with " +
    currentTerm.termDaysRemain +
    " calendar days left."; // Error
  if (daysRemainYear < 0) {
    document.getElementById("daysRemainYearContainer").innerHTML =
      "We have <strong>" +
      daysUntilNextSY +
      "</strong> summer days until <strong>" +
      nextSY.schoolyear +
      "</strong> begins.";
    // document.getElementById("daysRemainYearContainer").innerHTML = "Enjoy <strong>" + daysUntilNextSY + "</strong> summer days until <strong>" + nextSY.schoolyear + "</strong> begins on " + nextSY.terms[0].beg.toLocaleString('en-US', { month: 'long', day: 'numeric' }) + ".";
  } else {
    document.getElementById("daysRemainYearContainer").innerHTML =
      "There are <strong>" +
      daysRemainYear +
      "</strong> days until the end of the school year.";
  }
  // document.getElementById("dots_t0").innerHTML = dotsEmptyHtml[0] + dotsFilledHtml[0]; // Summer Vacation
  document.getElementById("dots_t1").innerHTML =
    dotsEmptyHtml[1] + dotsFilledHtml[1];
  document.getElementById("dots_t2").innerHTML =
    dotsEmptyHtml[2] + dotsFilledHtml[2];
  document.getElementById("dots_t3").innerHTML =
    dotsEmptyHtml[3] + dotsFilledHtml[3];
  document.getElementById("dots_t4").innerHTML =
    dotsEmptyHtml[4] + dotsFilledHtml[4];
  document.getElementById("dots_ps").innerHTML =
    dotsEmptyHtml[5] + dotsFilledHtml[5];
  document.getElementById("dots_ss").innerHTML =
    dotsEmptyHtml[6] + dotsFilledHtml[6];
  // Show upcoming events:
  let eHoliday = [];
  let eEvent = [];
  let eStudAct = [];
  let textHolidays = "";
  let textEvents = "";
  let textStudActs = "";
  // Collect only future events:
  for (i in datesOrdered) {
    if (datesOrdered[i].beg > dateToday) {
      // Collect future holidays:
      if (datesOrdered[i].eventType == "studentHoliday") {
        eHoliday.push(datesOrdered[i]);
      } else if (datesOrdered[i].eventType == "event") {
        // Collect future non-holidays:
        eEvent.push(datesOrdered[i]);
      } else {
        eStudAct.push(datesOrdered[i]);
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
// Call functions
showStuff();

function playAudio() {
  document.addEventListener("keydown", function (event) {
    let prettyGirls = document.getElementById("prettyGirls");
    if (event.keyCode == 80) {
      prettygirls.play();
    } else if (event.keyCode == 65) {
      airhorn.play();
    } else if (event.keyCode == 67) {
      choir.play();
    }
  });
}
playAudio();

// Keep screen awake:
// https://developer.mozilla.org/en-US/docs/Web/API/WakeLock/request
const requestWakeLock = async () => {
  try {
    const wakeLock = await navigator.wakeLock.request("screen");
  } catch (err) {
    // The wake lock request fails - usually system-related, such as low battery.

    console.log(`${err.name}, ${err.message}`);
  }
};

requestWakeLock();
