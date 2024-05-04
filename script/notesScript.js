let dbName = sessionStorage.getItem('user');
let db;
const noteObjectStore = "note";


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
    // add todays date in new note title when page opens
    function setNotesTitle() {
      let currentDate = new Date();
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      document.querySelector("#note-title").value = currentDate.toLocaleDateString(undefined, options);
    }
    setNotesTitle();
    generateListElements();
    // add initials to header
    document.querySelector("#initials-nav").textContent = sessionStorage.getItem("initials").toUpperCase();

    function getObjectStore(store_name, mode) {
      var tx = db.transaction(store_name, mode);
      return tx.objectStore(store_name);
    }

    // SAVE NOTE TO DATABASE AND ADD BUTTON ON SIDEBAR
    document.querySelector('#save-notes').addEventListener("click", function () {
      let notesTitle = document.querySelector('#note-title');
      let notes = document.querySelector('#notes');
      let ttl = notesTitle.value;
      let bdy = notes.value;
      let noteId;
        if (notesTitle.placeholder === "") {
          noteId = new Date().getTime();
          let newNoteObj = {number: noteId, title: ttl, body:bdy};
          let store = getObjectStore(noteObjectStore, "readwrite");
          let req = store.add(newNoteObj);

          req.onsuccess = function (evt) {
            createListElement(newNoteObj.title, noteId, newNoteObj.body);
            console.log("notes insertion was successful");
          };
          req.onerror = function () {
            console.error("add event failed", this.error);
          };
        } else {
          // let nt = document.querySelector('#note-title');
          // let n = document.querySelector("#notes");
          // noteId = Number(nt.placeholder);
          noteId = Number(notesTitle.placeholder);
          let store = getObjectStore(noteObjectStore, "readwrite");
          const req = store.get(noteId);
          req.onerror = (event) => {
            console.log("error", event);
          };
          req.onsuccess = (event) => {
            const data = event.target.result;
            data.title = ttl;
            data.body = bdy;
            console.log(data);

            const reqUpdate = store.put(data);
            reqUpdate.onerror = (event) => {
              console.log("error", event);
            };
            reqUpdate.onsuccess = (event) => {
              let li = document.getElementById(notesTitle.placeholder);
              console.log(li);
              console.log("event was updated");
              generateListElements();
            };
          };
        }
      setNotesTitle();
      notes.value = "";
      notes.placeholder = "";
    });

    // // CLEAR NOTE BUTTON MEANS CLEAR ALL VALUES IN NOTE
    // document.querySelector('#clear-notes').addEventListener("click", function () {
    //   document.querySelector("#note-title").value = "";
    //   document.querySelector("#notes").value = "";
    // });

    // CREATES A LIST ELEMENT
    function createListElement(notesTitle, noteId, noteBody) {
      // <li class="list-group-item"><a class="no-border-button" href=""><strong>Note </strong></a><i class="fa-regular fa-trash-can no-border-button del"></i></li>
      let strong = document.createElement("strong");
      strong.textContent = notesTitle;
      let a = document.createElement("button");
      a.classList.add("no-border-button");
      a.type = "button";
      a.appendChild(strong);

      let li = document.createElement("li");
      li.classList.add("list-group-item");
      li.id = noteId;
      li.appendChild(a);

      let list = document.querySelector("#notes-list-container ul");
      list.appendChild(li);
      noteListItemListener(li, notesTitle, noteBody, noteId);
    }

    // GENERATES LIST OF ELEMENTS
    function generateListElements() {
      let list = document.querySelector("#notes-list-container ul");
      clearListItems(list);
      // let notesStore = getObjectStore("notes", "readonly");
      let notesStore = db.transaction(noteObjectStore, "readonly").objectStore(noteObjectStore);
      // iterate through all of the notes entries in order
      let req = notesStore.openCursor();
      req.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) { // event entry
          createListElement(cursor.value.title, cursor.key, cursor.value.body);
          console.log(cursor.key);
          // noteListItemListener(cursor.value.title, cursor.value.body);
          console.log("element found");
          cursor.continue();
        } else {
          console.log("no more entries");
        }
      };
    }

    function clearListItems(list) {
      console.log(list);
      while (list.firstChild) {
          list.removeChild(list.firstChild);
      }
    }

    // CLICKING ON AN ELEMENT WILL OPEN THE NOTES INTO THE NOTEPAD
    function noteListItemListener(li, title, body, id) {
      console.log(li, title, body, id);
      li.addEventListener("click", function () {
        document.querySelector("#note-title").value = title;
        document.querySelector("#note-title").placeholder = id;
        document.querySelector('#notes').value = body;
      });
    }

    //  CLICKING ON THE PLUS SIGN CLEARS THE NOPTEPAD FOR A NEW ENTRY
    document.querySelector('#add-note').addEventListener("click", function () {
      let noteTitle = document.querySelector('#note-title');
      if (noteTitle.placeholder !== "") {
        noteTitle.placeholder = "";
      }
      setNotesTitle();
      document.querySelector('#notes').value = "";
    });

    // DELETE ENTRY FROM DATABASE AND DELETE ELEMENT
    document.querySelector('#delete-notes').addEventListener("click", function () {
      let id = Number(document.querySelector('#note-title').placeholder);
      const req = db.transaction(noteObjectStore, "readwrite")
        .objectStore(noteObjectStore)
        .delete(id);
      req.onsuccess = (event) => {
        console.log("successfully removes");
        // remove list element
        document.getElementById(id).remove();
        document.querySelector('#note-title').value = "";
        document.querySelector('#note-title').placeholder = "";
        document.querySelector('#notes').value = "";

      };
    });
}
