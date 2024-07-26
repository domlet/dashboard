// Function to refresh the page after 24 hours
function refreshPage() {
  var now = new Date();
  var nextRefresh = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  ); // Next day at midnight
  var timeToRefresh = nextRefresh - now;

  setTimeout(function () {
    location.reload(); // Refresh the page
  }, timeToRefresh);
}

// Call the refreshPage function when the page loads
window.onload = refreshPage;
