// Saves the button with the ID 'menuToggle' to a variable for later use.
const menuToggleButton = document.querySelectorAll('#menuToggle');

// Saves the buttons to variables for later use.
const registerMenu = document.querySelector('#registerMenu');
const loginMenu = document.querySelector('#loginMenu');

// Adds the 'hidden' class to the registration menu, 
// so when the page is first loaded the user can only see the login menu.
registerMenu.classList.add('hidden');

// Since there two buttons to toggle the menu 
// (button in the login menu to toggle it to the registration menu, vice versa),
// A for each loop is used to add an event listener to each one.
menuToggleButton.forEach(button => {
    button.addEventListener('click', () => {
        
        // This toggles the 'hidden' class on and off for each of the Menus, 
        // so the user can switch between the login menu and registration menu
        registerMenu.classList.toggle('hidden');
        loginMenu.classList.toggle('hidden');
    });
});