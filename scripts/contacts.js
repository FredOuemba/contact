let allContacts = [];
let avatarColors = [
  "#FF7A00", "#FF5C01", "#FFBB2E", "#0095FF", "#6E52FF", "#9327FF",
  "#00BEE8", "#1FD7C1", "#FF4646", "#FFC700", "#BEE800"
];
let currentlyOpenContact = null;
let justOpenedMenu = false;

/**
 * This function is used to generate a color for a contact name
 * 
 * @param {string} name - The name of the contact 
 * @returns {string} - a color string
 */
function getColorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash % avatarColors.length)];
}

/**
 * Gets initials from full name, f.e. RE
 * 
 * @param {string} name - full name
 * @returns {string} - initials in uppercase
 */
function getInitials(name) {
  if (!name) return "";
  let parts = name.trim().split(" ");
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

/**
 * Fetches all contact data from Firebase and renders them.
 * shown on the left side
 * 
 */
async function fetchData() {
  let res = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/.json");
  let data = await res.json();
  allContacts = Object.values(data.person || {});
  renderContacts();
  document.getElementById('new-contact').classList.remove('d_none');
}

/**
 * Renders the list of contacts grouped by the first letter.
 * sorts from a - z
 */
function renderContacts() {
  let panel = document.getElementById("contactPanel");
  panel.innerHTML = "";
  allContacts.sort((a, b) => a.name.localeCompare(b.name));
  let grouped = groupByLetter(allContacts);
  for (let letter in grouped) {
    panel.innerHTML += contactGroupTemplate(letter);
    grouped[letter].forEach(c => {
      panel.innerHTML += contactCardTemplate(c, getInitials(c.name));
    });
  }
}

/**
 * Groups contacts by the first letter of their name.
 * 
 * @param {Array<Object>} contacts - Array of contact objects.
 * @returns {Object} - Grouped contacts.
 */
function groupByLetter(contacts) {
  let grouped = {};
  for (let c of contacts) {
    let letter = c.name[0].toUpperCase();
    grouped[letter] = grouped[letter] || [];
    grouped[letter].push(c);
  }
  return grouped;
}

/**
 * Toggles the display of a contact’s detail view.
 * 
 * @param {string} name - The contact's name.
 */
function toggleShowContact(name) {
  let allContactElements = document.querySelectorAll('.contact-list');
  allContactElements.forEach(el => el.classList.remove('active'));

  if (window.innerWidth <= 768) {
    toggleShowContactMobile(name);
    return;
  }
  if (currentlyOpenContact === name) {
    closeContactOverlay();
  } else {
    showContact(name);
    currentlyOpenContact = name;
    let contactElement = Array.from(allContactElements).find(el =>
      el.textContent.includes(name)
    );
    if (contactElement) contactElement.classList.add('active');
  }
}

/**
 * closes the shown contact
 */
function closeContactOverlay() {
  document.getElementById("overlay").innerHTML = "";
  currentlyOpenContact = null;
}

/**
 * Displays contact details in the overlay.
 * 
 * @param {string} name - The contact's name.
 */
function showContact(name) {
  let contact = allContacts.find(c => c.name === name);
  let overlay = document.getElementById("overlay");
  overlay.innerHTML = contactDetailTemplate(contact);
}

/**
 * Opens the form overlay to add a new contact.
 * 
 */
function addContact() {
  clearOverlay();
  openModal("modalBackdrop");
  document.getElementById("addContactForm").innerHTML = contactAddFormTemplate();
}

/**
 * Opens the form to edit a contact’s information.
 * 
 * @param {string} name - The contact's name.
 */
function editContact(name) {
  let contact = allContacts.find(c => c.name === name);
  clearOverlay();
  openModal("modalBackdrop");
  document.getElementById("addContactForm").innerHTML = contactEditFormTemplate(contact);
}

/**
 * Handles the form submission for creating a new contact.
 * Prevents default form behavior, validates input, and calls saveContact if valid.
 *
 * @param {Event} event - The form submit event.
 */
function handleContactFormSubmit(event) {
  event.preventDefault();
  const isValid = validateContactForm();
  if (isValid) {
    saveContact();
  }
}

/**
 * Updates an existing contact in Firebase after validating the form.
 * 
 * @param {string} name - The original name or ID of the contact.
 * @async
 */
async function updateContact(name) {
  const form = document.getElementById("contactForm");
  if (!isFormValid(form)) return;
  const contactData = getUpdatedContactData();
  const contactKey = await getContactKeyByName(name);
  if (!contactKey) {
    alert("Contact not found.");
    return;
  }
  await updateContactInFirebase(contactKey, contactData);
  await finalizeContactUpdate(contactData.name);
}

/**
 * Validates the contact form using HTML5 form validation.
 * 
 * @param {HTMLFormElement} form - The contact form element.
 * @returns {boolean} - True if form is valid, false otherwise.
 */
function isFormValid(form) {
  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }
  return true;
}

/**
 * Extracts updated contact data from the form inputs.
 * 
 * @returns {{name: string, email: string, phone: string}} - The updated contact information.
 */
function getUpdatedContactData() {
  const { name, email, phone } = getInputValues();
  return { name, email, phone };
}

/**
 * Fetches the contact key from Firebase based on the original name or ID.
 * 
 * @param {string} name - The original name or ID of the contact.
 * @returns {Promise<string | null>} - The contact key or null if not found.
 */
async function getContactKeyByName(name) {
  const res = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json");
  const data = await res.json();
  const [key] = Object.entries(data || {}).find(([_, val]) => val.name === name || val.id === name) || [];
  return key || null;
}

/**
 * Updates the contact data in Firebase.
 * 
 * @param {string} key - The contact key in Firebase.
 * @param {Object} contactData - The updated contact information.
 * @async
 */
async function updateContactInFirebase(key, contactData) {
  await fetch(`https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person/${key}.json`, {
    method: "PUT",
    body: JSON.stringify(contactData),
    headers: { "Content-Type": "application/json" }
  });
}

/**
 * Finalizes the contact update process, including data refresh and UI update.
 * 
 * @param {string} newName - The updated name of the contact.
 * @async
 */
async function finalizeContactUpdate(newName) {
  await fetchData();
  closeOverlay();
  showContact(newName);
}


/**
 * Deletes a contact from Firebase.
 * @param {string} name - The contact's name.
 * @async
 */
async function deleteContact(name) {
  let res = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json");
  let data = await res.json();
  let [key] = Object.entries(data || {}).find(([_, val]) => val.name === name) || [];
  if (!key) return;

  await fetch(`https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person/${key}.json`, {
    method: "DELETE"
  });
  closeContactOverlay();
  fetchData();
  closeOverlay();
}

/**
 * Close the overlay in mobile view
 */
function closeOverlay(event) {
  if (event && event.target.id !== "modalBackdrop") return;
  clearOverlay();
  closeModal("modalBackdrop");
}

/**
 * Closes the overlay immediately without checks.
 */
function closeOverlayDirectly() {
  clearOverlay();
  closeModal("modalBackdrop");
}

/**
 * sets html in the add or edit contact form "" and closes overlay
 */
function clearOverlay() {
  document.getElementById("addContactForm").innerHTML = "";
  document.getElementById("overlay").innerHTML = "";
}

/**
 * Opens modal for adding or editing contact
 * @param {string} id - The ID of the modal element.
 */
function openModal(id) {
  document.getElementById(id).classList.remove("d_none");
  document.body.classList.add("modal-open");
}
/**
 * Closes modal for adding or editing contact
 * @param {string} id - The ID of the modal element.
 */
function closeModal(id) {
  document.getElementById(id).classList.add("d_none");
  document.body.classList.remove("modal-open");
}
/**
 * Displays a temporary success message after creating a contact
 * 
 */
function showSuccessMessage() {
  let toast = document.getElementById("successMessage");
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 3000);
}

/**
 * Displays a contact’s details in a modal on mobile version.
 * @param {string} name - The contact’s name.
 */
function toggleShowContactMobile(name) {
  let contact = allContacts.find(c => c.name === name);
  if (!contact) return;
  currentlyOpenContact = name; 
  document.getElementById("addContactForm").innerHTML = contactDetailTemplate(contact);
  openModal("modalBackdrop");
}

/**
 * Toggles the visibility of the contact options dropdown menu.
 * 
 */
function toggleContactMenu() {
  const menu = document.getElementById("contactMenu");
  if (menu.style.display === "flex") {
    menu.style.display = "none";
    menu.style.animation = "";
  } else {
    menu.style.display = "flex";
    menu.style.animation = "slideInFromRight 0.6s ease-out forwards";
  }
}

/**
 * Handles responsive changes when resizing the browser.
 * Closes the mobile modal view on desktop.
 */
window.addEventListener("resize", function () {
  let backdrop = document.getElementById("modalBackdrop");
  let addContactForm = document.getElementById("addContactForm");
  let isMobileContactOpen =
    backdrop &&
    !backdrop.classList.contains("d_none") &&
    addContactForm.innerHTML.includes("contact-info-box");

  if (isMobileContactOpen && window.innerWidth > 768) {
    closeOverlayDirectly();
    if (currentlyOpenContact) {
      showContact(currentlyOpenContact);
    }
  }
});

/**
 * Shows a success image when a contact is created.
 */
function showSuccessImage() {
  let imageBox = document.getElementById("contactCreatedImage");
  imageBox.classList.remove("d_none");

  setTimeout(() => {
    imageBox.classList.add("d_none");
  }, 3000);
}

/**
 * Global click event handler to toggle the visibility of the contact menu.
 * - Toggles the contact menu when the toggle button is clicked.
 * - Closes the menu if a click occurs inside the form while the menu is open.
 * - Ignores clicks if essential DOM elements are missing.
 * 
 * @param {MouseEvent} event - The click event triggered anywhere in the document.
 */
document.addEventListener("click", function (event) {
  const form = document.getElementById("addContactForm");
  const menu = document.getElementById("contactMenu");
  const toggle = document.getElementById("menu-contact-options");

  if (!form || !menu || !toggle) return;

  const clickedInsideForm = form.contains(event.target);
  const menuIsVisible = menu.style.display === "flex";
  const clickedOnToggle = toggle.contains(event.target);

  if (clickedOnToggle) {
    toggleContactMenu();
    event.stopPropagation(); 
  } else if (clickedInsideForm && menuIsVisible) {
    toggleContactMenu(); 
  }
}, true);