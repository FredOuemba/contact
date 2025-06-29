/**
 * Validates the contact form fields: name, email, and phone.
 * @returns {boolean}
 */
function validateContactForm() {
  const nameInput = document.getElementById("inputName");
  const emailInput = document.getElementById("inputEmail");
  const phoneInput = document.getElementById("inputPhone");

  resetValidation([nameInput, emailInput, phoneInput]);

  const validName = validateInput(nameInput, /^[A-Za-z\s]+$/, "Please enter a valid name.");
  const validEmail = validateInput(emailInput, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email.");
  const validPhone = validateInput(phoneInput, /^\d{7,}$/, "Phone number must be at least 7 digits and numeric.");

  return validName && validEmail && validPhone;
}

/**
 * Resets validation state on input fields.
 * @param {HTMLElement[]} inputs
 */
function resetValidation(inputs) {
  inputs.forEach(input => {
    input.style.border = "";
    const errorElem = input.parentNode.querySelector(".error-message");
    if (errorElem) errorElem.textContent = "";
  });
}

/**
 * Validates a single input against a regex pattern.
 * @param {HTMLElement} input
 * @param {RegExp} pattern
 * @param {string} message
 * @returns {boolean}
 */
function validateInput(input, pattern, message) {
  const value = input.value.trim();
  if (!pattern.test(value)) {
    setError(input, message);
    return false;
  }
  return true;
}

/**
 * Displays a validation error on an input field.
 * @param {HTMLElement} inputElement
 * @param {string} message
 */
function setError(inputElement, message) {
  inputElement.style.border = "1px solid #ff8190";
  const errorElem = inputElement.parentNode.querySelector(".error-message");
  if (errorElem) {
    errorElem.textContent = message;
    setTimeout(() => {
      inputElement.style.border = "";
      errorElem.textContent = "";
    }, 3000);
  }
}

/**
 * Saves a new contact to Firebase after validating the form.
 * Disables the submit button, sends data, and handles UI updates.
 * 
 * @async
 * @returns {Promise<void>}
 */
async function saveContact() {
  const submitBtn = document.getElementById("createContactBtn");

  if (!validateContactForm()) return;
  disableSubmitButton(submitBtn);

  const contactData = buildNewContact();

  try {
    await postContactToFirebase(contactData);
    await finalizeContactCreation();
  } catch (error) {
    handleContactError(error);
  } finally {
    enableSubmitButton(submitBtn);
  }
}

/**
 * Gathers input values and builds the contact object.
 * 
 * @returns {{name: string, email: string, phone: string}} New contact data.
 */
function buildNewContact() {
  const { name, email, phone } = getInputValues();
  return { name, email, phone };
}

/**
 * Sends a POST request to Firebase to save the contact.
 * 
 * @param {Object} contact - Contact data to save.
 * @returns {Promise<void>}
 */
async function postContactToFirebase(contact) {
  await fetch("https://join-2aee1-default-rtdb.europe-west1.firebasedatabase.app/person.json", {
    method: "POST",
    body: JSON.stringify(contact),
    headers: { "Content-Type": "application/json" }
  });
}

/**
 * Final steps after saving a contact: refresh, close overlay, show success.
 * 
 * @returns {Promise<void>}
 */
async function finalizeContactCreation() {
  await fetchData();
  closeOverlay();
  showSuccessMessage();
}

/**
 * Handles errors during the contact save process.
 * 
 * @param {Error} error - The thrown error.
 */
function handleContactError(error) {
  console.error("Error saving contact:", error);
}

/**
 * Disables the create button and shows loading state.
 * 
 * @param {HTMLButtonElement} btn - Submit button element.
 */
function disableSubmitButton(btn) {
  btn.disabled = true;
  btn.innerHTML = `Creating...`;
}

/**
 * Re-enables the create button and restores its label.
 * 
 * @param {HTMLButtonElement} btn - Submit button element.
 */
function enableSubmitButton(btn) {
  btn.disabled = false;
  btn.innerHTML = `Create contact <span>&check;</span>`;
}


/**
 * Collects values from the input fields.
 * @returns {{name: string, email: string, phone: string}}
 */
function getInputValues() {
  return {
    name: document.getElementById("inputName").value.trim(),
    email: document.getElementById("inputEmail").value.trim(),
    phone: document.getElementById("inputPhone").value.trim()
  };
}
