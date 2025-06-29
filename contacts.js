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
  let res = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/.json");
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
  document.getElementById("addContactForm").innerHTML = contactEditFormTemplate(contact);
}

/** Handle form submit (add/edit) */
function handleContactFormSubmit(event) {
  event.preventDefault();
  // Hier kannst du Save/Update-Logik ergänzen
  closeOverlay();
}

/** Delete contact */
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

/** ===================== Overlay Template: Figma-Style ===================== */
function contactEditFormTemplate(contact) {
  return `
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
          <div class="input-wrapper">
            <input id="inputName" value="${contact.name || ''}" required autocomplete="off" placeholder="Name">
            <img class="input-icon" src="assets/person.png" alt="Name">
          </div>
          <div class="input-wrapper">
            <input id="inputEmail" type="email" value="${contact.email || ''}" required autocomplete="off" placeholder="E-Mail">
            <img class="input-icon" src="assets/mail.png" alt="E-Mail">
          </div>
          <div class="input-wrapper">
            <input id="inputPhone" value="${contact.phone || ''}" required autocomplete="off" placeholder="Phone">
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