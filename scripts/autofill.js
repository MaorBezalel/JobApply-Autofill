function getInputFieldsKeywords() {
    return {
        firstName: ["firstName", "first name", "fname", "first_name"],
        lastName: ["lastName", "last name", "lname", "last_name"],
        fullName: ["fullName", "full name", "full_name", "name"],

        firstNameHebrew: ["שם פרטי", "firstNameHebrew", "first name hebrew"],
        lastNameHebrew: ["שם משפחה", "lastNameHebrew", "last name hebrew"],
        fullNameHebrew: ["שם מלא", "fullNameHebrew", "full name hebrew", "nameHebrew", "name hebrew"],

        email: ["email", "mail", "e-mail"],
        phone: ["phone", "phone number", "tel", "telephone", "mobile", "mobile number", "phonecell"],

        street: ["street"],
        city: ["city", "town", "location"],
        country: ["country"],
        state: ["state", "province", "region"],

        linkedin: ["linkedin", "linkedin url", "linkedin-url"],
        github: ["github", "github url", "github-url"],

        cv: ["cv", "resume", "file"],
    };
}

// Utility function to convert Base64 string to File
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
 *
 * @param {HTMLInputElement} inputField
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

async function autofillForm() {
    const { info } = await chrome.storage.local.get(null);

    // Collect input elements from the main document and iframes
    const allInputFields = document.querySelectorAll("input, textarea");

    for (const inputField of allInputFields) {
        // Skip if the input field is either already filled, disabled, or hidden
        if (
            (inputField.value?.trim?.() !== "" || inputField.files?.length > 0 || inputField.disabled,
            inputField.hidden || inputField.type === "image")
        ) {
            continue;
        }

        const attributes = getInputFieldAttributesThatWillBeChecked(inputField);

        // Check if any of the attributes of the input field matches the keywords
        for (const [fieldName, keywords] of Object.entries(getInputFieldsKeywords())) {
            if (
                keywords.some((keyword) => {
                    return Object.values(attributes).some((attr) => {
                        return attr?.toLowerCase()?.includes(keyword?.toLowerCase());
                    });
                })
            ) {
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
                break; // Break the loop if a match is found
            }
        }
    }
}

autofillForm();
