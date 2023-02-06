// Queries the ID's of the buttons, which I plan to add functionality to, 
// and saves the results to corresponding variables.
const menuButton = document.querySelector("#menuButton");
const watchlistButton = document.querySelector("#watchlistButton");
const loginButton = document.querySelector("#loginButton");

// Redirects the user to the provided url, by changing the href attribute of the window.
function redirect(__dirname) {
  window.location.href = __dirname;
}

// Adds an event listener for the 'Menu' button, which listens for a click, 
// and then uses an arrow function to redirect the user to index page.
menuButton.addEventListener('click', () => {
  redirect('./');
});

// Listens for a click and redirects user to the watchlist page.
watchlistButton.addEventListener('click', () => {
  redirect('./watchlist');
});

// Listens for a click and redirects user to the login page.
loginButton.addEventListener('click', () => {
  redirect('./login');
});