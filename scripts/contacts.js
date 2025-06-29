// contacts.js – Figma-Style Edit Contact Overlay & modernes Modul

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

/** Show edit overlay (Figma style, Drawer/Slideover) */
function editContact(name) {
  let contact = allContacts.find(c => c.name === name);
  clearOverlay();
  openModal("modalBackdrop");
  document.getElementById("addContactForm").innerHTML = contactEditFormTemplate(contact);
}

/** Handle form submit (add/edit) */
function handleContactFormSubmit(event) {
  event.preventDefault();
  if (validateContactForm()) {
    // Erkenn ob es ein neues oder ein bestehendes Kontaktformular ist
    let btn = document.getElementById("createContactBtn");
    if (btn) {
      // Neuer Kontakt
      saveContact();
    } else {
      // Bestehender Kontakt wird editiert
      let contactName = document.querySelector('.add-contact-overlay .edit-contact-avatar, .edit-contact-avatar');
      let oldName = contactName ? contactName.textContent : "";
      updateContact(oldName);
    }
  }
}

/** Save new contact */
async function saveContact() {
  const submitBtn = document.getElementById("createContactBtn");
  if (!validateContactForm()) return;
  disableSubmitButton(submitBtn);

  const contactData = {
    name: document.getElementById("inputName").value.trim(),
    email: document.getElementById("inputEmail").value.trim(),
    phone: document.getElementById("inputPhone").value.trim()
  };

  try {
    await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json", {
      method: "POST",
      body: JSON.stringify(contactData),
      headers: { "Content-Type": "application/json" }
    });
    await fetchData();
    closeOverlay();
    showSuccessMessage();
  } catch (error) {
    handleContactError(error);
  } finally {
    enableSubmitButton(submitBtn);
  }
}

/** Update existing contact (by oldName) */
async function updateContact(oldName) {
  const name = document.getElementById("inputName").value.trim();
  const email = document.getElementById("inputEmail").value.trim();
  const phone = document.getElementById("inputPhone").value.trim();

  let res = await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json");
  let data = await res.json();
  let entry = Object.entries(data || {}).find(([_, val]) => val.name === oldName);
  if (!entry) return;
  let [key] = entry;

  await fetch(`https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person/${key}.json`, {
    method: "PUT",
    body: JSON.stringify({ name, email, phone }),
    headers: { "Content-Type": "application/json" }
  });
  await fetchData();
  closeOverlay();
  showSuccessMessage("Contact updated successfully");
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

/** Close overlay directly (for close btn) */
function closeOverlayDirectly() {
  clearOverlay();
  closeModal("modalBackdrop");
}

/** Clear overlays */
function clearOverlay() {
  let form = document.getElementById("addContactForm");
  if (form) form.innerHTML = "";
  let overlay = document.getElementById("overlay");
  if (overlay) overlay.innerHTML = "";
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

/* ===== UI HELPERS ===== */

/** Zeigt erfolgreich-Toast */
function showSuccessMessage(msg="Contact successfully created") {
  let el = document.getElementById("successMessage");
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
  setTimeout(() => {
    el.style.display = "none";
  }, 1800);
}

/** Button states */
function disableSubmitButton(btn) {
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `Saving...`;
  }
}
function enableSubmitButton(btn) {
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `Create contact <span>&check;</span>`;
  }
}

function handleContactError(error) {
  alert("There was an error saving the contact. Try again.");
  console.error("Error:", error);
}

/* ====== Templates müssen eingebunden sein! ====== */
/* contactGroupTemplate, contactCardTemplate, contactDetailTemplate, contactAddFormTemplate, contactEditFormTemplate */
/* z.B. in contactTemplate.js oder hier importieren */

/* ====== Validation ====== */
/* Stelle sicher, dass validateContactForm in contact-form.js vorhanden ist */

/* ====== Exportiere für Tests (optional) ====== */
if (typeof module !== "undefined") {
  module.exports = {
    getColorForName,
    getInitials,
    groupByLetter,
    fetchData,
    renderContacts,
    showContact,
    addContact,
    editContact,
    handleContactFormSubmit,
    saveContact,
    updateContact,
    deleteContact
  };
}