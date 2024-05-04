const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
let monthIndex = 0;
sessionStorage.setItem("month", "0"); // save in sessionstorage for theme purposes
let weekIndex = 0;
let dayIndex = 0;
const millisecInDay = 86400000;
const calendarObjectStore = "calendar";
const noteObjectStore = "note";
const themeObjectStore = "theme";

let dbName = sessionStorage.getItem('user');
console.log(dbName);
let db;

    // open indexDB database -- name is username of current user
    let request = indexedDB.open(dbName, 8);
    request.onsuccess = function (evt) {
        db = request.result;
        addeventlisteners();

        console.log("openDb DONE");
    };
    request.onerror = function (evt) {
        console.error("openDb:", evt.target.errorCode);
    };

    request.onupgradeneeded = (event) => {
        db = event.target.result;

        // create objectStore to hold calendar events and use date/time as the keypath
        // date stored as passing epoch timestamp(the big old number) -- date and start time
        if (!db.objectStoreNames.contains(calendarObjectStore)) {
        db.createObjectStore(calendarObjectStore, {keyPath: "date"});
        }

        if (!db.objectStoreNames.contains(noteObjectStore)) {
            db.createObjectStore(noteObjectStore, { keyPath: "number" });
        }

        if (!db.objectStoreNames.contains(themeObjectStore)) {
            db.createObjectStore(themeObjectStore, { keyPath: "number" });
        }
    };

function addeventlisteners() {
    console.log('inside addeventlistener');
    document.querySelector("#initials-nav").textContent = sessionStorage.getItem("initials").toUpperCase();

    // obtaining an object store from an IndexedDB database by creating a transaction
    // on the specified object store with a given mode and returning the associated
    // object store
    function getObjectStore(store_name, mode) {
        var tx = db.transaction(store_name, mode);
        return tx.objectStore(store_name);
    }

// document.addEventListener('DOMContentLoaded', function() {
    // returns the number of days in a month
    function getDaysInMonth(year, month) {
        const lastDay = new Date(year, month + 1, 0).getDate();
        return lastDay;
    }

    // get events for a day on
    function getCalendarEvents(range, store, element) {
        let foundItems = true;
        // cursor to find events
        let req = store.openCursor(range);
        req.onsuccess = (event) => {
            const cursor = event.target.result;
            let list = element.querySelector('ul');
            if (cursor) { // if event is found create a list element
                // list.id = cursor.date;
                console.log(cursor.key);
                // clear list of previous events
                // clearListItems(list);
                createListElement(cursor.value.name, list, cursor.key);
                cursor.continue();
            } else {
                // clearListItems(list);
                console.log('no records');
                foundItems = false;
            }
        };
        return foundItems;
    }

    function clearListItems(list) {
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }
    }

        // populates monthly calendar
    function populateMonthly(monthIndex) {
        let actualDate = new Date();
        // find the first day of the month
        let firstWeekday = new Date(actualDate.getFullYear(), (actualDate.getMonth() + monthIndex), actualDate.getDate());
        firstWeekday.setDate(1);
        const options = {
            weekday: 'long',
        };
        let dayEpoch = firstWeekday.getTime();
        // gets index of weekdays from weekdayString
        let index = firstWeekday.toLocaleDateString(undefined, options)
        index = weekdays.indexOf(index);
        // array of cards in monthly
        monthlyCards = document.querySelectorAll('.monthly .card');
        // adds title for each card
        for (let i = 0; i < 42; i++) {
            let title = monthlyCards[i].querySelector('h6');
            let list = monthlyCards[i].querySelector('ul');
            // let nextDayEpoch = dayEpoch + millisecInDay;
            if (i >= index && i < getDaysInMonth(firstWeekday.getFullYear(), firstWeekday.getMonth()) + index) {
                title.textContent = i - index + 1;

                clearListItems(list);
                // create bound range to find all the indexes in a current day not including the first second of the next day
                let nextDayEpoch = dayEpoch + millisecInDay;
                const boundKeyRange = IDBKeyRange.bound(dayEpoch, nextDayEpoch, false, true);
                // FOR ALL DAYS OF THE MONTH, GET EVENTS AND CREATE LIST ITEMS FOR THEM
                let calendarStore = getObjectStore(calendarObjectStore, 'readonly');
                getCalendarEvents(boundKeyRange, calendarStore, monthlyCards[i]);

                // increment dayEpoch
                dayEpoch = nextDayEpoch;
            } else {
                title.textContent = '';
                // clear list items

                clearListItems(list);
                // remove list items from calendar
            }
        }
        document.querySelector('#theme-button').classList.remove("cal-no-display");
        // set monthly title
        let dateOptions = {
            year: 'numeric',
            month: 'long',
        };
        document.querySelector("#monthly-title").textContent = firstWeekday.toLocaleDateString(undefined, dateOptions);
        return firstWeekday.toLocaleDateString(undefined, dateOptions);
    }

    // populates daily calendar
    function populateDaily(dayIndex) {
        let actualDate = new Date();
        // sets daily title
        let currentDate = new Date(actualDate.getFullYear(), actualDate.getMonth(), (actualDate.getDate() + dayIndex));
        let curEpoch = currentDate.getTime();
        let nextEpoch = curEpoch + millisecInDay;
        let card = document.querySelector('#day div');
        let list = document.querySelector("#daily-list ul");
        clearListItems(list)
        const boundKeyRange = IDBKeyRange.bound(curEpoch, nextEpoch, false, true);
        let calendarStore = getObjectStore(calendarObjectStore, 'readonly');
        getCalendarEvents(boundKeyRange, calendarStore, card);
        const options = {
            day: 'numeric',
            month: 'long',
        };
        document.querySelector('#theme-button').classList.add("cal-no-display");
        document.querySelector("#monthly-title").textContent = currentDate.toLocaleDateString(undefined, options);
        return currentDate.toLocaleDateString(undefined, options);
    }

    // populates weekly calendar
    function populateWeekly(weekIndex) {
        let actualDate = new Date();
        let currentDate = new Date(actualDate.getFullYear(), actualDate.getMonth(), (actualDate.getDate() + (6 * weekIndex)));
        let dayOfWeek = currentDate.getDay(); // sunday = 0
        let dayOfMonth = currentDate.getDate();

        let firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), (dayOfMonth - dayOfWeek));
        let lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), (dayOfMonth - dayOfWeek + 6));
        let weekCards = document.querySelectorAll('.weekly .card');
        for (let i = 0; i < 7; i++) {
            const cardOptions = {
                weekday: 'long',
                day: 'numeric'
            }
            let date = new Date(currentDate.getFullYear(), currentDate.getMonth(), (dayOfMonth - dayOfWeek + i));
            let curEpoch = date.getTime();
            let list = weekCards[i].querySelector('ul');
            let title = weekCards[i].querySelector('h6');

            clearListItems(list);
            // create bound range to find all the indexes in a current day not including the first second of the next day
            let nextDayEpoch = curEpoch + millisecInDay;
            const boundKeyRange = IDBKeyRange.bound(curEpoch, nextDayEpoch, false, true);
            // FOR ALL DAYS OF THE MONTH, GET EVENTS AND CREATE LIST ITEMS FOR THEM
            let calendarStore = getObjectStore(calendarObjectStore, 'readonly');
            getCalendarEvents(boundKeyRange, calendarStore, weekCards[i]);

            title.textContent = date.toLocaleDateString(undefined, cardOptions);
        }
        document.querySelector('#theme-button').classList.add("cal-no-display");
        // fill out the weekly calendar title
        const options = {
            month: 'short',
            day: 'numeric',
        };
        document.querySelector("#monthly-title").textContent = firstDay.toLocaleDateString(undefined, options) + ' - ' + lastDay.toLocaleDateString(undefined, options);
        return firstDay.toLocaleDateString(undefined, options) + ' - ' + lastDay.toLocaleDateString(undefined, options);
    }

    // returns if the calendar is a weekly, daily, or monthly
    function getCalendarType() {
        if (document.querySelector('#calendar-drop-month').textContent === 'Monthly') {
            return 0;
        } else if (document.querySelector('#calendar-drop-month').textContent === 'Weekly') {
            return 1;
        } else if (document.querySelector('#calendar-drop-month').textContent === 'Daily') {
            return 2;
        }
    }

    // dynamically sets calendar dropdown label according to window size
    function setDropdown() {
        const screenWidth = window.innerWidth;
        if (screenWidth < 768) {
            document.querySelector('#calendar-drop-month').textContent = 'Daily';
            document.querySelector('#monthly-title').textContent = populateDaily(dayIndex);
        } else if (screenWidth < 1200) {
            document.querySelector('#calendar-drop-month').textContent = 'Weekly';
            document.querySelector('#monthly-title').textContent = populateWeekly(weekIndex);
        } else {
            document.querySelector('#calendar-drop-month').textContent = 'Monthly';
            document.querySelector('#monthly-title').textContent = populateMonthly(monthIndex);
        }
    }

    // set display characteristics of calendar type
    function removeDisplay() {
        document.querySelector('#month').classList.remove('cal-display');
        document.querySelector('#month').classList.remove('cal-no-display');
        document.querySelector('#week').classList.remove('cal-display');
        document.querySelector('#week').classList.remove('cal-no-display');
        document.querySelector('#day').classList.remove('cal-display');
        document.querySelector('#day').classList.remove('cal-no-display');
    }

    // calendar add event modal event date - set minimum input values
    function setAddEventModalMinimumInputs() {
        // set mimimum date value to current date
        let eventDate = document.getElementById('event-date');
        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 1);
        let formattedDate = currentDate.toISOString().split('T')[0];
        eventDate.min = formattedDate;
    }

    // checks time input is after current input
    // returns true if time is after current time, returns false otherwise
    function timeAfterCurrent(inputElement) {
        let currentDate = new Date();
        const formattedCurrentTime = `${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;
        let inputTime = inputElement.value;
        console.log("current time:", formattedCurrentTime);
        console.log("input:", inputTime);

        let eventDate = document.getElementById('event-date');
        currentDate.setDate(currentDate.getDate() -1);
        let formattedDate = currentDate.toISOString().split('T')[0];
        console.log(eventDate.value);
        console.log(formattedDate);

        return (inputTime > formattedCurrentTime && eventDate.value === formattedDate) || (eventDate.value > formattedDate);
    }

    // checks end time input is after start time]
    function afterStart(startElement, endElement) {
        return startElement.value < endElement.value;
    }

    // LEFT BUTTON POPULATE CALENDAR
    document.querySelector("#previousBtn").addEventListener('click', function () {
        if (getCalendarType() === 0) {
            monthIndex = monthIndex -1;
            let monthstr = monthIndex.toString();
            sessionStorage.setItem("month", monthstr);
            populateMonthly(monthIndex);
        } else if (getCalendarType() === 1) {
            weekIndex = weekIndex - 1;
            populateWeekly(weekIndex);
        } else {
            dayIndex = dayIndex - 1;
            populateDaily(dayIndex);
        }
        setTheme();
    });

    // RIGHT BUTTON POPULATE CALENDAR
    document.querySelector("#nextBtn").addEventListener('click', function () {
        if (getCalendarType() === 0) {
            monthIndex = monthIndex + 1;
            let monthstr = monthIndex.toString();
            sessionStorage.setItem("month", monthstr);
            populateMonthly(monthIndex);
        } else if (getCalendarType() === 1) {
            weekIndex = weekIndex + 1;
            populateWeekly(weekIndex);
        } else {
            dayIndex = dayIndex + 1;
            populateDaily(dayIndex);
        }
        setTheme();
    });

    // WHEN WINDOW IS RESIZED, CHANGE DROPDOWN TEXTCONTENT
    window.addEventListener('resize', setDropdown);

    window.addEventListener('resize', removeDisplay);

    // DROPDOWN CHANGE CAL FORMAT TO MONTH DISREGARDING SCREEN SIZE
    document.querySelector('#mly').addEventListener('click', function () {
        removeDisplay();
        document.querySelector('#month').classList.toggle('cal-display');
        document.querySelector('#week').classList.toggle('cal-no-display');
        document.querySelector('#day').classList.toggle('cal-no-display');
        document.querySelector('#calendar-drop-month').textContent = 'Monthly';
        document.querySelector('#monthly-title').textContent = populateMonthly(monthIndex);
    });

    // DROPDOWN CHANGE CAL FORMAT TO WEEK DISREGARDING SCREEN SIZE
    document.querySelector('#wly').addEventListener('click', function () {
        removeDisplay();
        document.querySelector('#month').classList.toggle('cal-no-display');
        document.querySelector('#week').classList.toggle('cal-display');
        document.querySelector('#day').classList.toggle('cal-no-display');
        document.querySelector('#calendar-drop-month').textContent = 'Weekly';
        document.querySelector('#monthly-title').textContent = populateWeekly(weekIndex);
    });

    // DROPDOWN CHANGE CAL FORMAT TO DAY DISREGARDING SCREEN SIZE
    document.querySelector('#dly').addEventListener('click', function () {
        removeDisplay();
        document.querySelector('#month').classList.toggle('cal-no-display');
        document.querySelector('#week').classList.toggle('cal-no-display');
        document.querySelector('#day').classList.toggle('cal-display');
        document.querySelector('#calendar-drop-month').textContent = 'Daily';
        document.querySelector('#monthly-title').textContent = populateDaily(dayIndex);
    });

    // VALIDATE EVENT ENTRY AND ADD IT TO CALENDAR // to-do check if value start date/time is already in calendar
    let eventModInputs = document.querySelector('#save-event');
    eventModInputs.addEventListener('click', function () {
        let isValidEvent = verifyEventInformation();
        if (isValidEvent !== undefined) {
            addEventToCalendarDB(isValidEvent);
            // populateMonthly(0);
            // populateWeekly(0);
            // populateDaily(0);
            if (getCalendarType() === 0) {
                populateMonthly(monthIndex);
            } else if (getCalendarType() === 1) {
                populateWeekly(weekIndex);
            } else {
                populateDaily(dayIndex);
            }


            try {
                let myModal = document.getElementById('menu-modal');
                let temp = bootstrap.Modal.getOrCreateInstance(myModal);
                temp.hide();
                console.log('After hiding modal');
            } catch (error) {
                console.error('Error:', error);
            }

            document.querySelector("#menu-modal h2").textContent = "Add Event";
            document.querySelector('#event-name').value = "";
            document.querySelector('#event-date').value = "";
            document.querySelector("#start-time").value = "";
            document.querySelector("#end-time").value = "";
            document.querySelector("#event-notes").value = "";
        }

    });

    // let closeEdit = document.querySelector('#close-event');
    // closeEdit.addEventListener("click", function () {
    //     const reviewModal = new bootstrap.Modal(document.getElementById("menu-modal"), {focus: true});
    //     reviewModal.hide();
    // });

    function verifyEventInformation() {
        let isName, isDate, isStart, isEnd = false;

        // VALIDATE EVENTNAME HAS INPUT
        let eventName = document.getElementById('event-name');
        if (eventName.value === '') {
            eventName.placeholder = 'There must be an event name';
            eventName.classList.add('invalid-input');
        } else {
            eventName.classList.remove('invalid-input');
            isName = true;
        }

        // VALIDATE EVENT DATE HAS ENTRY AND DATE IS IN THE FUTURE
        let eventDate = document.getElementById('event-date');
        if (eventDate.value === '') {
            eventDate.classList.add('invalid-input');
            document.getElementById('event-date-invalid').classList.add('invalid-icon');
        } else {
            eventDate.classList.remove('invalid-input');
            document.getElementById('event-date-invalid').classList.remove('invalid-icon');
            isDate = true;
        }

        // VALIDATE START TIME IS AFTER CURRENT TIME
        let startTime = document.getElementById('start-time');
        let isAfterCurrent = timeAfterCurrent(startTime);
        if (startTime.value === '') {
            startTime.classList.add('invalid-input');
            document.getElementById('start-time-invalid').classList.add('invalid-icon');
        } else if (!isAfterCurrent) { // if event date is today, time cannot be before present
            startTime.classList.add('invalid-input');
            document.getElementById('start-time-invalid').classList.add('invalid-icon');
        } else {
            startTime.classList.remove('invalid-input');
            document.getElementById('start-time-invalid').classList.remove('invalid-icon');
            isStart = true;
        }
        if (eventDate.value === '' && startTime.value !== ''){
            startTime.classList.remove('invalid-input');
            document.getElementById('start-time-invalid').classList.remove('invalid-icon');
            isStart = true;
        }

        // VALIDATE START TIME IS AFTER CURRENT TIME
        let endTime = document.getElementById('end-time');
        let timestr;
        let isAfterStart= afterStart(startTime, endTime);
        if (endTime.value === '') {
            endTime.classList.add('invalid-input');
            document.getElementById('end-time-invalid').classList.add('invalid-icon');
        } else if (!isAfterStart) { // if event date is today, time cannot be before present
            endTime.classList.add('invalid-input');
            document.getElementById('end-time-invalid').classList.add('invalid-icon');
        } else {
            endTime.classList.remove('invalid-input');
            document.getElementById('end-time-invalid').classList.remove('invalid-icon');
            let dateTime = eventDate.value + 'T' + endTime.value;
            let enddate = new Date(dateTime);
            timestr = enddate.toLocaleTimeString("en-US", {hour:"2-digit", minute:"2-digit"});
            isEnd = true;
        }

        // get event notes
        let eventNotes = document.getElementById('event-notes');

        if (isName && isDate && isStart && isEnd) {
            // ADD EVENT TO DATABASE
            // create key from date and start time input
            var combinedDateTime = eventDate.value + 'T' + startTime.value;
            var dateKey = new Date(combinedDateTime);
            var dateKeyString = dateKey.getTime(); // use epochtimestamp as calendar key

            // create an object representing the event entry
            let newEventObj = {date: dateKeyString, eventEnd:timestr, name:eventName.value, notes: eventNotes.value};
            return newEventObj;
        }
        return undefined;
    }

    // adds an event to the calendarDB database
    function addEventToCalendarDB(newEventObj) {
        // get a reference to the indexeddb calendar objectstore
        let store = getObjectStore(calendarObjectStore, "readwrite");
        // initialize request object for adding the event to the calendar
        let req = store.add(newEventObj);

        // event handler for successful insertion into database
        req.onsuccess = function (evt) {
            console.log('insertion in db successful', evt);
        }
        req.onerror = function() {
            console.error("add event error");
        }
    }

    function createListElement(eventName, list, key) {
        let listItem = document.createElement('li');
        listItem.textContent = eventName;
        listItem.classList.add("list-group-item");
        listItem.classList.add("p-1");
        listItem.classList.add("fs-5");
        listItem.id = key;

        list.appendChild(listItem);
        eventButtonModal(listItem);
    }




    // function that creates an event listener for a List-item that opens a modal showing the event information and edit/delete buttons
    function eventButtonModal(element) {
        console.log("entered eventButtonModal function");
        const myModal = new bootstrap.Modal(document.getElementById('review-event'), {focus:true});
        let elementId = parseInt(element.id);
        element.addEventListener("click", function () {
            // add start time, end time, and notes information to modal
            document.getElementById('review-event-name').textContent = element.textContent;
            let store = getObjectStore(calendarObjectStore, "readwrite");
            let date = new Date(elementId);
            myModal.show();

            let req = store.get(elementId);
            req.onerror = (event) => {
                console.log(event);
            };
            req.onsuccess = (event) => {
                const data = event.target.result;

                // add all the event information to the modal
                let dateFormat = {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                };
                let date = new Date(data.date);
                let datestr =  date.toLocaleDateString('en-US', dateFormat);                document.getElementById("date-no-edit").textContent = `Date: ${datestr}`;
                document.getElementById("start-no-edit").textContent = `Start time: ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit"})}`;
                document.getElementById("end-time-no-edit").textContent = `End time: ${data.eventEnd}`;
                document.getElementById("notes-no-edit").textContent = `Event notes: ${data.notes}`;

                // delete event
                document.getElementById("delete-event").addEventListener("click", function () {
                    let req = getObjectStore(calendarObjectStore, "readwrite").delete(elementId);
                    req.onsuccess = (event) => {
                        console.log("the event was deleted");
                        element.remove();
                        myModal.hide();
                    };
                    req.onerror = (event) => {
                        console.log("the event could not be deleted");
                    }
                });

                // {date: dateKeyString, eventEnd:timestr, name:eventName.value, notes: eventNotes.value};

                const reviewModal = new bootstrap.Modal(document.getElementById("menu-modal"), {focus:true});
                // edit event modal
                document.getElementById("edit-event").addEventListener("click", function () {
                    myModal.hide(); // close review event modal
                    // change modal values to event values
                    let menuModalTitle = document.querySelector("#menu-modal h2");
                    menuModalTitle.textContent = "Edit Event";
                    document.querySelector("#event-name").value = element.textContent;
                    let formattedDate = date.toISOString().split('T')[0];
                    document.querySelector("#event-date").value = formattedDate;
                    let timestr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit"}).split(" ")[0];
                    document.querySelector("#start-time").value = timestr;
                    document.querySelector("#end-time").value = data.eventEnd.split(" ")[0];
                    document.querySelector("#event-notes").value = data.notes;
                    document.querySelector("#save-event").classList.add("cal-no-display");
                    document.querySelector("#save-review-event").classList.toggle("cal-no-display");
                    reviewModal.show();
                });

                // save revised event
                document.getElementById("save-review-event").addEventListener("click", function () {
                    let revisedEvt = verifyEventInformation();
                    if (revisedEvt !== undefined) {
                        let datacopy = data;
                        // delete original event
                        let req = getObjectStore(calendarObjectStore, "readwrite").delete(elementId);
                        req.onsuccess = (event) => {
                            console.log("the event was deleted");
                            element.remove();
                        };
                        req.onerror = (event) => {
                            console.log("the event could not be deleted");
                        }

                        data.date = revisedEvt.date;
                        data.eventEnd = revisedEvt.eventEnd;
                        data.name = revisedEvt.name;
                        data.notes = revisedEvt.notes;

                        let sstore = getObjectStore(calendarObjectStore, "readwrite");
                        const reqUpdate = sstore.add(data);
                        reqUpdate.onerror = (event) => {
                            console.log(event);
                        };
                        reqUpdate.onsuccess = (event) => {
                            console.log("data was successfully updated");
                            // populateDaily(0);
                            // populateWeekly(0);
                            // populateMonthly(0);
                            if (getCalendarType() === 0) {
                                populateMonthly(monthIndex);
                            } else if (getCalendarType() === 1) {
                                populateWeekly(weekIndex);
                            } else {
                                populateDaily(dayIndex);
                            }

                            reviewModal.hide();
                            // myModal.hide();
                            document.querySelector("#menu-modal h2").textContent = "Add Event";
                            document.querySelector('#event-name').value = "";
                            document.querySelector('#event-date').value = "";
                            document.querySelector("#start-time").value = "";
                            document.querySelector("#end-time").value = "";
                            document.querySelector("#event-notes").value = "";

                        };
                    }
                });


            };
            // myModal.show();
        });
    }

    // // SET DROPDOWN TO APPROPRIATE LABEL
    setDropdown();

    // SET EVENT DATE TO CURRENT DATE IN CALENDAR ADD EVENT MODAL
    setAddEventModalMinimumInputs();
    setTheme();


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //// THEME STUFF -- add theme when page opens and when the left an right calendar buttons get pushed
    /**
     * 1. create date object for current month/year of calendar
     * 2. find entry for calendar's current month/year in indexdb using a cursor
     * 3. load json file
     * 4. set root variables to specific colors
     */
    function setTheme() {
        console.log("set theme");
        let actualDate = new Date();
        let calDate; // holds the calendar date
        if (getCalendarType() === 0) { // monthly
            calDate = new Date(actualDate.getFullYear(), (actualDate.getMonth() + monthIndex), actualDate.getDate());
        } else if (getCalendarType() === 1) { // weekly
            let weekday = new Date(actualDate.getFullYear(), actualDate.getMonth(), (actualDate.getDate() + (6 * weekIndex)));
            let dayOfWeek = weekday.getDay(); // sunday = 0
            let dayOfMonth = weekday.getDate();

            calDate = new Date(weekday.getFullYear(), weekday.getMonth(), (dayOfMonth - dayOfWeek)); // first day of week will determine the theme
        } else { // daily
            calDate = new Date(actualDate.getFullYear(), actualDate.getMonth(), (actualDate.getDate() + dayIndex));
        }

        let dateKey = new Date(calDate.getFullYear(), calDate.getMonth(), 1); // key is the first day of the month
        let dateid = dateKey.getTime(); // number key for theme entry

        // use cursor to loop through entries
        let themeStore = getObjectStore(themeObjectStore, "readonly");
        themeStore.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            console.log("cursor open");
            if (cursor) {
                console.log("key", cursor.key);
                let theme = cursor.value.theme
                if (cursor.key == dateid) { // theme is found
                    // load json file
                    const url='https://w3stu.cs.jmu.edu/johns5el/cs343/Project/json/themes.json'

                    fetch(url).then((response) => response.text())
                        .then((text) => {
                            let data = JSON.parse(text); // array of themes and colors
                            let filteredData = data.filter((object) => object.name === theme);
                            console.log(filteredData);
                            document.documentElement.style.setProperty('--wt-clr', filteredData[0].white);
                            document.documentElement.style.setProperty('--lt-clr', filteredData[0].light);
                            document.documentElement.style.setProperty('--md-clr', filteredData[0].medium);
                            document.documentElement.style.setProperty('--md-drk-clr', filteredData[0].mediumDark);
                            document.documentElement.style.setProperty('--drk-clr', filteredData[0].dark);
                            console.log("json");
                            document.getElementById("left-image").src = filteredData[0].left;
                            document.getElementById("right-image").src = filteredData[0].right;

                        }).catch(error => console.error('Error fetching JSON:', error));
                }
                else { // theme is not found so theme is default
                    document.documentElement.style.setProperty('--wt-clr', '#edede8');
                    document.documentElement.style.setProperty('--lt-clr', '#c1d0d7');
                    document.documentElement.style.setProperty('--md-clr', '#61707d');
                    document.documentElement.style.setProperty('--md-drk-clr', '#371b37');
                    document.documentElement.style.setProperty('--drk-clr', '#031105');
                    console.log("notjson");
                    document.getElementById("left-image").src = "images/themesImages/right-star.png";
                    document.getElementById("right-image").src = "images/themesImages/left-star.png";
                }
                cursor.continue();
            } else {
                console.log("no more entries");
            }
        }
    }
}
