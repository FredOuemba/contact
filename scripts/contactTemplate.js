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
          <div style="display:flex;margin-top:10px;">
          <button onclick="editContact('${contact.name}')" class="contact-detail-buttons">
  <img class="icon-default" src="./svg/edit-black.svg" alt="Edit">
   <img class="icon-hover" src="./svg/edit-blue-hover.svg" alt="Edit">Edit
</button>
          <button onclick="deleteContact('${contact.name}')" class="contact-detail-buttons">
            <img class="icon-default" src="./svg/delete.svg" alt="Delete">
             <img class="icon-hover" src="./svg/delete-blue-hover.svg" alt="Delete">Delete
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
    <img src="./svg/edit-black.svg" alt="Edit"> Edit
  </button>
  <button onclick="deleteContact('${contact.name}')">
    <img src="./svg/delete.svg" alt="Delete"> Delete
  </button>
</div>
`;
}

/**
 * Template for the contact add form with HTML5 validation.
 *
 * @returns {string} - HTML string.
 */
function contactAddFormTemplate() {
  return `
    <div class="add-contact-overlay">
      <div class="close-btn" onclick="closeOverlayDirectly()">×</div>
      <div class="add-contact-left">
        <img src="./svg/Capa 1.svg" class="add-contact-logo">
        <h2>Add contact</h2>
        <p>Tasks are better with a team!</p>
        <div class="underline"></div>
      </div>
      <div class="add-contact-right">
        <form id="contactForm" onsubmit="handleContactFormSubmit(event)">
          <div class="add-contact-form">
            <img id="contactImage" src="./svg/addContactPic.svg" class="profile-responsive-middle" alt="Contact Icon">
            
            <div class="add-contact-form-section">
              <div class="add-contact-inputs">
                <div class="input-wrapper">
                  <input id="inputName" type="text" placeholder="Name">
                  <img src="./svg/person.svg" class="input-icon">
                  <div class="error-message"></div> <!-- Platz für Name-Fehler -->
                </div>
                <div class="input-wrapper">
                  <input id="inputEmail" type="text" placeholder="Email">
                  <img src="./svg/mail.svg" class="input-icon">
                  <div class="error-message"></div> <!-- Platz für Email-Fehler -->
                </div>
                <div class="input-wrapper">
                  <input id="inputPhone" type="text" placeholder="Phone">
                  <img src="./svg/call.svg" class="input-icon">
                  <div class="error-message"></div> <!-- Platz für Phone-Fehler -->
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


/**
 * Template for the contact edit form with HTML5 validation.
 *
 * @param {Object} contact - Contact object.
 * @returns {string} - HTML string.
 */
function contactEditFormTemplate(contact) {
  const initials = getInitials(contact.name);
  const color = getColorForName(contact.name);

  return `
    <div class="add-contact-overlay">
      <div class="close-btn" onclick="closeOverlayDirectly(); showContact('${contact.name}')">&times;</div>
      <div class="add-contact-left">
        <img src="./svg/Capa 1.svg" class="add-contact-logo">
        <h2>Edit contact</h2>
        <div class="underline"></div>
      </div>
      <div class="add-contact-right">
        <form id="contactForm" onsubmit="event.preventDefault(); if (validateContactForm()) updateContact('${contact.id || contact.name}');">
          <div class="add-contact-form">
            <div class="edit-contact-avatar" style="background: ${color};">${initials}</div>
            
            <div class="add-contact-form-section">
              <div class="add-contact-inputs">
                <div class="input-wrapper">
                  <input id="inputName" type="text" placeholder="Name" value="${contact.name}">
                  <img src="./svg/person.svg" class="input-icon">
                  <div class="error-message"></div>
                </div>
                <div class="input-wrapper">
                  <input id="inputEmail" type="text" placeholder="Email" value="${contact.email}">
                  <img src="./svg/mail.svg" class="input-icon">
                  <div class="error-message"></div>
                </div>
                <div class="input-wrapper">
                  <input id="inputPhone" type="text" placeholder="Phone" value="${contact.phone}">
                  <img src="./svg/call.svg" class="input-icon">
                  <div class="error-message"></div>
                </div>
              </div>

              <div class="edit-contact-buttons">
                <button type="button" class="delete-btn" onclick="deleteContact('${contact.name}')">Delete</button>
                <button type="submit" class="save-btn">Save <span>&check;</span></button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
}
