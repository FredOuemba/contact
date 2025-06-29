/**
 * Sets up password field functionality when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    const fields = [
        {
            input: document.getElementById('password'),
            toggle: document.getElementById('togglePassword'),
            lock: document.querySelector('#password + .input-icon')
        },
        {
            input: document.getElementById('confirmPassword'),
            toggle: document.getElementById('toggleConfirmPassword'),
            lock: document.querySelector('#confirmPassword + .input-icon')
        }
    ];

    const lookOn = 'svg/visibility_off.svg';
    const lookOff = 'svg/visibility.svg';

    fields.forEach(field => setupPasswordField(field, lookOn, lookOff));
});

/**
 * Sets up a password field with toggle functionality
 * @param {Object} field - The field object containing input and toggle elements
 * @param {string} lookOn - The path to the visibility off icon
 * @param {string} lookOff - The path to the visibility on icon
 */
function setupPasswordField(field, lookOn, lookOff) {
    if (field.input && field.toggle && field.lock) {
        field.input.addEventListener('input', () => handleInput(field, lookOn));
        field.toggle.addEventListener('click', () => togglePassword(field, lookOn, lookOff));
        initialIconState(field, lookOn);
    }
}

/**
 * Handles input changes in password fields
 * @param {Object} field - The field object
 * @param {string} lookOn - The path to the visibility off icon
 */
function handleInput(field, lookOn) {
    if (field.input.value.length > 0) {
        field.toggle.style.display = 'block';
        field.lock.style.display = 'none';
    } else {
        resetField(field, lookOn);
    }
}

/**
 * Toggles password visibility
 * @param {Object} field - The field object
 * @param {string} lookOn - The path to the visibility off icon
 * @param {string} lookOff - The path to the visibility on icon
 */
function togglePassword(field, lookOn, lookOff) {
    if (field.input.type === 'password') {
        field.input.type = 'text';
        field.toggle.src = lookOff;
    } else {
        field.input.type = 'password';
        field.toggle.src = lookOn;
    }
}

/**
 * Sets the initial icon state based on field value
 * @param {Object} field - The field object
 * @param {string} lookOn - The path to the visibility off icon
 */
function initialIconState(field, lookOn) {
    if (field.input.value.length > 0) {
        field.toggle.style.display = 'block';
        field.lock.style.display = 'none';
    } else {
        resetField(field, lookOn);
    }
}

/**
 * Resets a field to its default state
 * @param {Object} field - The field object
 * @param {string} lookOn - The path to the visibility off icon
 */
function resetField(field, lookOn) {
    field.toggle.style.display = 'none';
    field.lock.style.display = 'block';
    field.input.type = 'password';
    field.toggle.src = lookOn;
}
