let allContacts = [];
let avatarColors = [
  "#FF7A00", "#FF5C01", "#FFBB2E", "#0095FF", "#6E52FF", "#9327FF",
  "#00BEE8", "#1FD7C1", "#FF4646", "#FFC700", "#BEE800"
];
let currentlyOpenContact = null;

/** Utility: Get color for contact name */
function getColorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash % avatarColors.length)];
}

/** Utility: Get initials from name */
function getInitials(name) {
  if (!name) return "";
  let parts = name.trim().split(" ");
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

/** Fetch and render contacts */
async function fetchData() {
  let res = await fetch("https://editcontactdatenbank-default-rtdb.europe-west1.firebasedatabase.app/.json");
  let data = await res.json();
  allContacts = Object.values(data.person || {});
  renderContacts();
  document.getElementById('new-contact').classList.remove('d_none');
}

/** Render contacts grouped by first letter */
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

/** Group contacts by first letter */
function groupByLetter(contacts) {
  let grouped = {};
  for (let c of contacts) {
    let letter = c.name[0].toUpperCase();
    grouped[letter] = grouped[letter] || [];
    grouped[letter].push(c);
  }
  return grouped;
}

/** Show details for a contact */
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

/** Close contact detail overlay */
function closeContactOverlay() {
  document.getElementById("overlay").innerHTML = "";
  currentlyOpenContact = null;
}

/** Show contact details in overlay */
function showContact(name) {
  let contact = allContacts.find(c => c.name === name);
  let overlay = document.getElementById("overlay");
  overlay.innerHTML = contactDetailTemplate(contact);
}

/** Add new contact overlay */
function addContact() {
  clearOverlay();
  openModal("modalBackdrop");
  document.getElementById("addContactForm").innerHTML = contactAddFormTemplate();
}

/** Show edit overlay: Figma style, from left */
function editContact(name) {
  let contact = allContacts.find(c => c.name === name);
  clearOverlay();
  openModal("modalBackdrop");
  document.getElementById("addContactForm").innerHTML = `
    <div class="edit-contact-overlay-slidein">
      <div class="edit-contact-header">
        <img src="assets/sidebarLogo.png" alt="Join Logo">
        Edit contact
        <button class="edit-contact-close" onclick="closeOverlay()">&times;</button>
      </div>
      <div class="edit-contact-content">
        <div class="edit-contact-avatar" style="background: ${getColorForName(contact.name)};">
          ${getInitials(contact.name)}
        </div>
        <form class="edit-contact-form" id="contactForm" onsubmit="handleContactFormSubmit(event)">
          <input type="hidden" id="oldContactName" value="${contact.name}">
          <div class="floating-label-group">
            <input id="inputName" value="${contact.name || ''}" required autocomplete="off" placeholder=" " />
            <label for="inputName"></label>
            <img class="input-icon" src="assets/person.png" alt="Name">
          </div>
          <div class="floating-label-group">
            <input id="inputEmail" type="email" value="${contact.email || ''}" required autocomplete="off" placeholder=" " />
            <label for="inputEmail"></label>
            <img class="input-icon" src="assets/mail.png" alt="E-Mail">
          </div>
          <div class="floating-label-group">
            <input id="inputPhone" value="${contact.phone || ''}" required autocomplete="off" placeholder=" " />
            <label for="inputPhone"></label>
            <img class="input-icon" src="assets/call.png" alt="Phone">
          </div>
          <div class="edit-contact-buttons">
            <button type="button" class="delete-btn" onclick="deleteContact('${contact.name}')">Delete</button>
            <button type="submit" class="save-btn">Save <span>&#10003;</span></button>
          </div>
        </form>
      </div>
    </div>
  `;
}

/** Handle form submit (add/edit) */
async function handleContactFormSubmit(event) {
  event.preventDefault();
  const name = document.getElementById("inputName").value.trim();
  const email = document.getElementById("inputEmail").value.trim();
  const phone = document.getElementById("inputPhone").value.trim();
  const oldNameField = document.getElementById("oldContactName");

  // Simple validation
  if (!name || !email || !phone) return;

  if (oldNameField) {
    // === EDIT MODE ===
    const oldName = oldNameField.value;
    let res = await fetch("https://editcontactdatenbank-default-rtdb.europe-west1.firebasedatabase.app/person.json");
    let data = await res.json();
    let [key] = Object.entries(data || {}).find(([_, val]) => val.name === oldName) || [];
    if (key) {
      await fetch(`https://editcontactdatenbank-default-rtdb.europe-west1.firebasedatabase.app/person/${key}.json`, {
        method: "PUT",
        body: JSON.stringify({ name, email, phone }),
        headers: { "Content-Type": "application/json" }
      });
    }
  } else {
    // === CREATE MODE ===
    await fetch("https://editcontactdatenbank-default-rtdb.europe-west1.firebasedatabase.app/person.json", {
      method: "POST",
      body: JSON.stringify({ name, email, phone }),
      headers: { "Content-Type": "application/json" }
    });
  }
  await fetchData();
  closeOverlay();
}

/** Delete contact */
async function deleteContact(name) {
  let res = await fetch("https://editcontactdatenbank-default-rtdb.europe-west1.firebasedatabase.app/person.json");
  let data = await res.json();
  let [key] = Object.entries(data || {}).find(([_, val]) => val.name === name) || [];
  if (!key) return;
  await fetch(`https://editcontactdatenbank-default-rtdb.europe-west1.firebasedatabase.app/person/${key}.json`, {
    method: "DELETE"
  });
  closeContactOverlay();
  fetchData();
  closeOverlay();
}

/** Close overlay (modal) */
function closeOverlay(event) {
  if (event && event.target.id !== "modalBackdrop") return;
  clearOverlay();
  closeModal("modalBackdrop");
}

/** Clear overlays */
function clearOverlay() {
  document.getElementById("addContactForm").innerHTML = "";
  document.getElementById("overlay").innerHTML = "";
}

/** Open modal for overlay */
function openModal(id) {
  document.getElementById(id).classList.remove("d_none");
  document.body.classList.add("modal-open");
}

/** Close modal for overlay */
function closeModal(id) {
  document.getElementById(id).classList.add("d_none");
  document.body.classList.remove("modal-open");
}

/** Show contact in modal on mobile */
function toggleShowContactMobile(name) {
  let contact = allContacts.find(c => c.name === name);
  if (!contact) return;
  currentlyOpenContact = name; 
  document.getElementById("addContactForm").innerHTML = contactDetailTemplate(contact);
  openModal("modalBackdrop");
}

/**
 * Template generator for a contact card in the list.
 *
 * @param {Object} contact - The contact object.
 * @param {string} initials - Initials for the avatar.
 * @returns {string} - HTML string.
 */
function contactCardTemplate(contact, initials) {
  const color = getColorForName(contact.name);
  return `
      <div class="contact-list" onclick="toggleShowContact('${contact.name}')">
        <div class="avatar" style="background:${color}">${initials}</div>
        <div class="contact-name">
          <div><strong>${contact.name}</strong></div>
          <div class="contact-email">${contact.email}</div>
        </div>
      </div>`;
}

/**
 * Template for a grouped contact list by letter.
 *
 * @param {string} letter - First letter of contact name.
 * @returns {string} - HTML string.
 */
function contactGroupTemplate(letter) {
  return `<div class="contact-group-letter">${letter}</div>`;
}

/**
 * Template for detailed contact view.
 *
 * @param {Object} contact - Contact object.
 * @returns {string} - HTML string.
 */
function contactDetailTemplate(contact) {
  const initials = getInitials(contact.name);
  const bg = getColorForName(contact.name);
  return `
    <div class="contact-responsive-header">
      <div><h1>Contacts</h1>
      <span class="header-infoline">Better with a team
      </div>
      <img src="svg/arrow-left-line.svg" class="arrow-back" onclick="closeOverlayDirectly()">
      </div>
      <div class="contact-info-box slide-in" >
        <div class="contact-name-box">
          <div class="show-contact-avatar" style="background:${bg};">
          ${initials}</div>
          <div><h2 style="margin:0;">${contact.name}</h2>
          <div style="display:flex;margin-top:10px;gap:8px;">
            <button onclick="editContact('${contact.name}')" class="contact-detail-buttons">
              <img class="edit-icon" src="./assets/edit.png" alt="Edit">
              <span class="edit-label">Edit</span>
            </button>
            <button onclick="deleteContact('${contact.name}')" class="contact-detail-buttons">
              <img class="delete-icon" src="./assets/delete.png" alt="Delete">
              <span class="delete-label">Delete</span>
            </button>
          </div>
          </div>
        </div>
        <div class="contact-information-div">
          <h3 style="font-weight:200;">Contact Information</h3><br>
          <p><strong>Email</strong></p><a href="mailto:${contact.email}">${contact.email}</a>
          <p><strong>Phone</strong></p><p>${contact.phone}</p>
        </div>
      </div>
       <img class="menu-contact-options" id="menu-contact-options" onclick="toggleContactMenu()" src="./svg/MenuContactOptions.svg" alt="Options">
       <div class="custom-dropdown" id="contactMenu">
        <button onclick="editContact('${contact.name}')">
          <img src="./svg/edit-black.svg" alt=""> Edit
        </button>
        <button onclick="deleteContact('${contact.name}')">
          <img src="./svg/delete.svg" alt=""> Delete
        </button>
      </div>
  `;
}

/**
 * Template for the contact add form with floating labels.
 *
 * @returns {string} - HTML string.
 */
function contactAddFormTemplate() {
  return `
    <div class="add-contact-overlay">
      <div class="close-btn" onclick="closeOverlayDirectly()">×</div>
      <div class="add-contact-left">
        <img src="./assets/sidebarLogo.png" class="add-contact-logo">
        <h2>Add contact</h2>
        <p>Tasks are better with a team!</p>
        <div class="underline"></div>
      </div>
      <div class="add-contact-right">
        <form id="contactForm" onsubmit="handleContactFormSubmit(event)">
          <div class="add-contact-form">
            <img id="contactImage" src="./assets/Frame 79.png" class="profile-responsive-middle" alt="Contact Icon">
            <div class="add-contact-form-section">
              <div class="add-contact-inputs">
                <div class="floating-label-group">
                  <input id="inputName" type="text" required placeholder=" " autocomplete="off" />
                  <label for="inputName">Name</label>
                  <img src="./assets/person.png" class="input-icon">
                </div>
                <div class="floating-label-group">
                  <input id="inputEmail" type="email" required placeholder=" " autocomplete="off" />
                  <label for="inputEmail">Email</label>
                  <img src="./assets/mail.png" class="input-icon">
                </div>
                <div class="floating-label-group">
                  <input id="inputPhone" type="text" required placeholder=" " autocomplete="off" />
                  <label for="inputPhone">Phone</label>
                  <img src="./assets/call.png" class="input-icon">
                </div>
              </div>
              <div class="add-contact-buttons">
                <button type="button" class="cancel-btn" onclick="closeOverlay()">Cancel <span>&times;</span></button>
                <button id="createContactBtn" type="submit" class="create-btn">
                  Create contact <span>&check;</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
}

function closeOverlayDirectly() {
  clearOverlay();
  closeModal("modalBackdrop");
}

// Initial load
window.onload = fetchData;