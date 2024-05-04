let dbName = sessionStorage.getItem('user');
let db;
const themeObjectStore = "theme";


let request = indexedDB.open(dbName, 8);
request.onerror = function (evt) {
  console.error("openDb:", evt.target.errorCode);
};
request.onupgradeneeded = (event) => {
    db = event.target.result;
};
request.onsuccess = function (evt) {
  db = request.result;
  console.log('openDB DONE');
  addEventListeners();
};

function addEventListeners() {
  //     // add initials to navigation
  document.querySelector("#initials-nav").textContent = sessionStorage.getItem("initials").toUpperCase();

    // for every theme button on the page, create an event listener
    document.querySelectorAll(".col button").forEach((button) => {
      button.addEventListener('click', function () {
        // get month date
        let firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        // use month sessionstorage to get month offset to get month date of theme
        let themeDate = new Date(firstDayOfMonth.getFullYear(), (firstDayOfMonth.getMonth() + parseInt(sessionStorage.getItem("month"))));
        // put themedate and theme in objectstore
        let newThemeObj = {number: themeDate.getTime(), theme:button.id};
        const themeStore = db.transaction(themeObjectStore, "readwrite")
          .objectStore(themeObjectStore);
        const requestUpdate = themeStore.put(newThemeObj);
        requestUpdate.onerror = (event) => {
          console.log(event);
        };
        requestUpdate.onsuccess = (event) => {
          // when theme is added go back to calendar
          console.log("The theme was added");
          window.location.href = "calendar.html";
        };
      });
    });
}
