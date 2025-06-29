import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { updateUserInitials } from './userInitials.js';

/**
 * Initializes all signup form event listeners when DOM is loaded.
 */
document.addEventListener('DOMContentLoaded', function () {
    initSignupFormEvents();
});

/**
 * Sets up core event listeners for signup button and form inputs.
 */
function initSignupFormEvents() {
    let signupButton = document.getElementById('signupButton');
    if (signupButton) signupButton.addEventListener('click', handleSignUp);

    setupToggleIcons();
    setupNameInputListener();
    setupEmailInputListener();
    setupPasswordInputListener();
    setupConfirmPasswordListener();
    setupPrivacyCheckboxListener();
}

/**
 * Handles real-time validation on the name input field.
 */
function setupNameInputListener() {
    let nameInput = document.getElementById('name');
    nameInput.addEventListener('input', function () {
        document.getElementById('name-error').style.display = 'none';
        this.style.border = '1px solid #D1D1D1';
    });
}

/**
 * Handles real-time validation on the email input field.
 */
function setupEmailInputListener() {
    let emailInput = document.getElementById('email');
    emailInput.addEventListener('input', function () {
        document.getElementById('email-error').style.display = 'none';
        document.getElementById('email-format-error').style.display = 'none';
        this.style.border = '1px solid #D1D1D1';
    });
}

/**
 * Handles real-time password input and weakness validation.
 */
function setupPasswordInputListener() {
    let passwordInput = document.getElementById('password');
    passwordInput.addEventListener('input', function () {
        let password = this.value;
        let weakError = document.getElementById('password-weak-error');

        clearPasswordErrors();
        this.style.border = '1px solid #D1D1D1';

        if (password.length > 0) {
            weakError.style.display = isPasswordWeak(password) ? 'block' : 'none';
        } else {
            weakError.style.display = 'none';
        }
    });
}

/**
 * Clears all password-related error messages.
 */
function clearPasswordErrors() {
    document.getElementById('password-error').style.display = 'none';
    document.getElementById('password-length-error').style.display = 'none';
    document.getElementById('password-weak-error').style.display = 'none';
}

/**
 * Clears error messages for confirm password input.
 */
function setupConfirmPasswordListener() {
    let confirmInput = document.getElementById('confirmPassword');
    confirmInput.addEventListener('input', function () {
        document.getElementById('confirm-password-error').style.display = 'none';
        document.getElementById('password-match-error').style.display = 'none';
        this.style.border = '1px solid #D1D1D1';
    });
}

/**
 * Hides privacy policy error when checkbox is checked.
 */
function setupPrivacyCheckboxListener() {
    let checkbox = document.getElementById('privacy-policy');
    checkbox.addEventListener('change', function () {
        if (this.checked) {
            document.getElementById('privacy-error').style.display = 'none';
        }
    });
}

/**
 * Resets all error messages and styling
 */
function resetErrors() {
    document.querySelectorAll('.error-message').forEach(e => e.style.display = 'none');
    document.querySelectorAll('.input-field input').forEach(f => f.classList.remove('error'));
    document.getElementById('privacy-policy').classList.remove('error');
}

/**
 * Gets all form values
 * @returns {Object} - Object containing all form values
 */
function getFormValues() {
    return {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        privacyPolicy: document.getElementById('privacy-policy').checked
    };
}

/**
 * Validates the name field
 * @param {string} name - The name to validate
 * @returns {boolean} - Whether the name is valid
 */
function validateName(name) {
    if (!name || !name.includes(' ')) {
        showError('name-error', 'Please enter your Fullname (with space)', 'name');
        return false;
    }
    return true;
}

/**
 * Validates the email field
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
function validateEmail(email) {
    if (!email) {
        showError('email-error', '', 'email');
        return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        showError('email-format-error', '', 'email');
        return false;
    }
    return true;
}

/**
 * Validates the password fields
 * @param {string} password - The password to validate
 * @param {string} confirmPassword - The confirmation password
 * @returns {boolean} - Whether the passwords are valid
 */
function validatePassword(password, confirmPassword) {
    let valid = true;
    if (!password) {
        showError('password-error', '', 'password');
        valid = false;
    }
    if (!confirmPassword) {
        showError('confirm-password-error', '', 'confirmPassword');
        valid = false;
    }
    if (password && confirmPassword && password !== confirmPassword) {
        showError('password-match-error', '', 'password');
        showError('password-match-error', '', 'confirmPassword');
        valid = false;
    }
    return valid;
}

/**
 * Validates the privacy policy checkbox
 * @param {boolean} privacyPolicy - Whether the checkbox is checked
 * @returns {boolean} - Whether the privacy policy is accepted
 */
function validatePrivacy(privacyPolicy) {
    if (!privacyPolicy) {
        showError('privacy-error', '', 'privacy-policy');
        return false;
    }
    return true;
}

/**
 * Shows an error message
 * @param {string} id - The ID of the error element
 * @param {string} msg - The error message
 * @param {string} inputId - The ID of the input field
 */
function showError(id, msg, inputId) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = 'block';
        if (msg) el.textContent = msg;
        if (inputId) document.getElementById(inputId).classList.add('error');
        if (id === 'name-error') {
            document.getElementById('name').style.border = '1px solid #ff0000';
        } else if (id === 'email-error' || id === 'email-format-error') {
            document.getElementById('email').style.border = '1px solid #ff0000';
        } else if (id === 'password-error' || id === 'password-length-error' || id === 'password-weak-error') {
            document.getElementById('password').style.border = '1px solid #ff0000';
        } else if (id === 'confirm-password-error' || id === 'password-match-error') {
            document.getElementById('confirmPassword').style.border = '1px solid #ff0000';
        }
    }
}

/**
 * Handles the sign up form submission
 * @param {Event} e - The form submission event
 * @returns {Promise<void>}
 */
async function handleSignUp(e) {
    e.preventDefault();
    resetErrors();
    const { name, email, password, confirmPassword, privacyPolicy } = getFormValues();
    let hasError = false;
    if (!validateName(name)) hasError = true;
    if (!validateEmail(email)) hasError = true;
    if (!validatePassword(password, confirmPassword)) hasError = true;
    if (!validatePrivacy(privacyPolicy)) hasError = true;
    if (hasError) return;
    await trySignUp(name, email, password);
}

/**
 * Attempts to sign up a new user
 * @param {string} name - The user's name
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @returns {Promise<void>}
 */
async function trySignUp(name, email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        await saveUserData(userCredential.user, name, email);
        showSuccessAndRedirect();
    } catch (error) {
        handleSignUpError(error);
    }
}

/**
 * Saves user data to Firestore and localStorage
 * @param {Object} user - The Firebase user object
 * @param {string} name - The user's name
 * @param {string} email - The user's email
 * @returns {Promise<void>}
 */
async function saveUserData(user, name, email) {
    const userData = {
        name, email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        tasks: [], contacts: []
    };
    await setDoc(doc(db, "users", user.uid), userData);
    localStorage.setItem('currentUser', JSON.stringify({ uid: user.uid, ...userData }));
    updateUserInitials();
}

/**
 * Shows success message and redirects to index page
 */
function showSuccessAndRedirect() {
    const msg = document.getElementById('success-message');
    if (msg) msg.style.display = 'block';
    setTimeout(() => window.location.href = 'Index.html', 2000);
}

/**
 * Handles sign up errors
 * @param {Error} error - The Firebase authentication error
 */
function handleSignUpError(error) {
    const el = document.getElementById('general-error');
    if (!el) return;
    let msg = '';
    switch (error.code) {
        case 'auth/email-already-in-use': msg = 'This email is already registered.'; break;
        case 'auth/invalid-email': msg = 'Please enter a valid email address.'; break;
        case 'auth/weak-password': msg = 'Password is too weak.'; break;
        default: msg = 'An error occurred during registration.';
    }
    el.textContent = msg;
    el.style.display = 'block';
}

/**
 * Sets up password toggle icons
 */
function setupToggleIcons() {
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function() {
            const input = document.getElementById(this.getAttribute('data-target'));
            if (input) input.type = input.type === 'password' ? 'text' : 'password';
        });
    });
}

/**
 * Checks if a password is considered weak based on character composition.
 * A strong password must include at least one uppercase letter, one lowercase letter, and one number.
 *
 * @param {string} password - The password string to evaluate.
 * @returns {boolean} - Returns true if the password is weak, otherwise false.
 */
function isPasswordWeak(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return !(hasUpperCase && hasLowerCase && hasNumbers);
}
