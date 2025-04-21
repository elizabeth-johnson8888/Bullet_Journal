let hostname = 'https://w3stu.cs.jmu.edu/johns5el/cs343/Project/json/';
let url = `${hostname}account.json`

document.addEventListener("DOMContentLoaded", function () {
  // WHEN LOGIN BUTTON IS PUSHED, CHECK IF THE ACCOUNT IS VALID
  document.getElementById('login').addEventListener('click', function () {
    let accStr = localStorage.getItem('accounts');
    let accs = JSON.parse(accStr);
    console.log(accStr);
    let username = document.getElementById('uname');
    let password = document.getElementById('pass');
    let isFound = accs.find((info) => info.user === username.value && info.pass === password.value);

    if (isFound === undefined) {
      // error message
      console.log('inside if statement');
      document.getElementById("invalid-acc").classList.add("invalid-account");
      username.value = '';
      password.value = '';
    } else {
      // save user and initials in session storage
      sessionStorage.setItem('user', isFound.user);
      sessionStorage.setItem('initials', isFound.initials);
      // link to calendar
      window.location.href = 'calendar.html';
    }
  });

  // WHEN SIGNUP-SUBMIT BUTTON IS PRESSED ADD ACCCOUNT TO LOCALSTORAGE/SESSIONSTORAGE AND REDIRECT
  document.getElementById('signup-submit').addEventListener('click', function () {
    console.log("inside signup submit");
    // get sign up form values
    let username = document.getElementById("username");
    let us = username.value;
    let password = document.getElementById("password");
    let pas = password.value;
    let initials = document.getElementById("initials");

    let accountsStr = localStorage.getItem('accounts');
    // create object representing account
    let newAccount = {
      user: username.value,
      pass: password.value,
      initials: initials.value
    };
    if (accountsStr != null) {
      console.log("inside accounts = null");
      let accounts = JSON.parse(accountsStr);
      console.log(accounts);
      // search to see if the username is already in use
      if (accounts instanceof Array) {
        let isFound = accounts.find((info) => info.user === username.value);
        if (isFound !== undefined) {
          // error message
          console.log('inside if statement');
          document.getElementById("invalid-username").classList.add("invalid-account");
          username.value = '';
        } else { // username is unique
          // add account to accounts array and update localStorage
          accounts.push(newAccount);
          accountsStr = JSON.stringify(accounts);
          localStorage.setItem("accounts", accountsStr);

          // add username and initials to sessionStorage
          sessionStorage.setItem('user', username.value);
          sessionStorage.setItem('initials', initials.value);

          // redirect to calendar page
          window.location.href = 'calendar.html';
        }
      } else {
        if (accounts.user === username.value) {
          document.getElementById("invalid-username").classList.add("invalid-account");
          username.value = '';
        } else { // user name is blank
          // let accountsArr = [accounts];
          // accountsArr.push(newAccount);
          // accountsStr = JSON.stringify(accountsArr);
          // localStorage.setItem("accounts", accountsStr);

          // // add username and initials to sessionStorage
          // sessionStorage.setItem('user', username.value);
          // sessionStorage.setItem('initials', initials.value);

          // // redirect to calendar page
          // window.location.href = 'calendar.html';
          document.getElementById("invalid-username").classList.add("invalid-account");

        }
      }
    }
     else { // if accountstr is null
      let accountFix = [newAccount];
      newAccountStr = JSON.stringify(accountFix);
      // newAccountStr = JSON.stringify(newAccount);
      console.log(newAccountStr);
      localStorage.setItem("accounts", newAccountStr);

      // add username and initials to sessionStorage
      sessionStorage.setItem('user', username.value);
      sessionStorage.setItem('initials', initials.value);

      // redirect to calendar page
      window.location.href = 'calendar.html';
    }
    // // add username and initials to sessionStorage
    // sessionStorage.setItem('user', username.value);
    // sessionStorage.setItem('initials', initials.value);

    // // redirect to calendar page
    // window.location.href = 'calendar.html';
  });

  window.addEventListener('storage', function(event) {
    console.log('Storage event:', event);
  });
});
