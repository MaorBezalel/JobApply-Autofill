/**
 * Get keywords that will be used to match and identify the input fields in the job application form to autofill
 *
 * @param {object} info Object containing user information
 * @returns {object} Object containing keywords for each input field
 */
function getInputFieldsKeywords(info) {
    const tryToApplyKeywords = (field, info, keywords) => (info[field] ? keywords : undefined);
    return {
        firstName: tryToApplyKeywords("firstName", info, ["firstName", "first name", "fname", "first_name"]),
        lastName: tryToApplyKeywords("lastName", info, ["lastName", "last name", "lname", "last_name"]),
        fullName:
            tryToApplyKeywords("firstName", info, ["fullName", "full name", "name"]) &&
            tryToApplyKeywords("lastName", info, ["fullName", "full name", "name"]),

        firstNameHebrew: tryToApplyKeywords("firstNameHebrew", info, ["שם פרטי", "firstNameHebrew", "first name hebrew"]),
        lastNameHebrew: tryToApplyKeywords("lastNameHebrew", info, ["שם משפחה", "lastNameHebrew", "last name hebrew"]),
        fullNameHebrew:
            tryToApplyKeywords("firstNameHebrew", info, ["שם מלא", "שם", "fullNameHebrew", "full name hebrew", "nameHebrew"]) &&
            tryToApplyKeywords("lastNameHebrew", info, ["שם מלא", "שם", "fullNameHebrew", "full name hebrew", "nameHebrew"]),

        email: tryToApplyKeywords("email", info, ["email", "mail", "e-mail"]),
        phone: tryToApplyKeywords("phone", info, [
            "phone",
            "phone number",
            "tel",
            "telephone",
            "mobile",
            "mobile number",
            "phonecell",
        ]),

        street: tryToApplyKeywords("street", info, ["street"]),
        city: tryToApplyKeywords("city", info, ["city", "town", "location"]),
        country: tryToApplyKeywords("country", info, ["country"]),
        state: tryToApplyKeywords("state", info, ["state", "province", "region"]),

        linkedin: tryToApplyKeywords("linkedin", info, ["linkedin", "linkedin url", "linkedin-url"]),
        github: tryToApplyKeywords("github", info, ["github", "github url", "github-url"]),

        cv: tryToApplyKeywords("cv", info, ["cv", "resume", "file"]),
    };
}

/**
 * Convert base64 string to File object
 * @param {string} base64 Base64 string
 * @param {string} filename File name
 * @param {string} mimeType e.g. "application/pdf"
 * @returns {File}
 */
function base64ToFile(base64, filename, mimeType) {
    const byteString = atob(base64.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new File([ab], filename, { type: mimeType });
}

/**
 * Get attributes of an input field that will be checked for
 *
 * @param {HTMLInputElement} inputField
 * @returns {object} Object containing attributes of the input field
 */
function getInputFieldAttributesThatWillBeChecked(inputField) {
    return {
        id: inputField.id ? inputField.id?.toLowerCase?.() : undefined,
        name: inputField.name ? inputField.name?.toLowerCase?.() : undefined,
        placeholder: inputField.placeholder ? inputField.placeholder?.toLowerCase?.() : undefined,
        ariaLabel: inputField.ariaLabel ? inputField.ariaLabel?.toLowerCase?.() : undefined,
        label: inputField.labels ? inputField.labels?.[0]?.textContent?.replace?.("\n", "").trim?.().toLowerCase?.() : undefined,
        dataField: inputField.dataset?.field ? inputField.dataset?.field?.toLowerCase?.() : undefined,
        autoComplete: inputField.autocomplete ? inputField.autocomplete?.toLowerCase?.() : undefined,
    };
}

/**
 * Check if the input field should be skipped from autofilling
 * @param {HTMLInputElement} inputField
 * @returns {boolean}
 */
function shouldSkipInputField(inputField) {
    return (
        inputField.value?.trim?.() !== "" ||
        inputField.files?.length > 0 ||
        inputField.disabled ||
        inputField.hidden ||
        inputField.type === "image"
    );
}

/**
 * Check if the input field matches the keywords
 * @param {object} attributes Object containing attributes of the input field
 * @param {string[]} keywords Keywords to match
 * @returns {boolean}
 */
function matchKeywords(attributes, keywords) {
    return keywords.some((keyword) => {
        return Object.values(attributes).some((attr) => {
            return attr?.toLowerCase()?.includes(keyword?.toLowerCase());
        });
    });
}

/**
 * Fill the input field with the provided data
 * @param {HTMLInputElement} inputField
 * @param {string} fieldName
 * @param {object} info Object containing user information
 */
function fillInputField(inputField, fieldName, info) {
    if (inputField.type === "file") {
        const { base64, name, type } = info[fieldName];
        const file = base64ToFile(base64, name, type);
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        inputField.files = dataTransfer.files;
    } else if (fieldName === "fullName") {
        inputField.value = `${info.firstName} ${info.lastName}`;
    } else if (fieldName === "fullNameHebrew") {
        inputField.value = `${info.firstNameHebrew} ${info.lastNameHebrew}`;
    } else {
        inputField.value = info[fieldName] || "";
    }
}

/**
 * Autofill the job application form with the user saved information
 */
async function autofillForm() {
    const { info } = await chrome.storage.local.get(null);

    // Collect input elements from the main document and iframes
    const allInputFields = document.querySelectorAll("input, textarea");

    for (const inputField of allInputFields) {
        if (shouldSkipInputField(inputField)) {
            continue;
        }

        const attributes = getInputFieldAttributesThatWillBeChecked(inputField);

        for (const [fieldName, keywords] of Object.entries(getInputFieldsKeywords(info))) {
            if (keywords && matchKeywords(attributes, keywords)) {
                fillInputField(inputField, fieldName, info);
                break; // Break the loop if a match is found
            }
        }
    }
}

autofillForm();
