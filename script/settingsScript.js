document.addEventListener('DOMContentLoaded', function () {
    let initials = sessionStorage.getItem("initials");
    document.querySelector("#initials-nav").textContent = initials.toUpperCase();
    document.querySelector("#initials").textContent = initials;
    document.querySelector('#user').textContent = sessionStorage.getItem("user");
});
