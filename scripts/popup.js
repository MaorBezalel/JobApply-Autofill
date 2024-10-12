/**
 * Get attributes of an input field that will be checked.
 *
 * @param {HTMLInputElement} inputField
 * @returns {Object} Attributes of the input field.
 */
function getInputFieldAttributesThatWillBeChecked(inputField) {
    return {
        id: inputField.id ? inputField.id.toLowerCase() : undefined,
        name: inputField.name ? inputField.name.toLowerCase() : undefined,
        placeholder: inputField.placeholder ? inputField.placeholder.toLowerCase() : undefined,
        ariaLabel: inputField.ariaLabel ? inputField.ariaLabel.toLowerCase() : undefined,
        label: inputField.labels ? inputField.labels[0].textContent.replace("\n", "").trim().toLowerCase() : undefined,
        dataField: inputField.dataset.field ? inputField.dataset.field.toLowerCase() : undefined,
        autoComplete: inputField.autocomplete ? inputField.autocomplete.toLowerCase() : undefined,
    };
}

/**
 * Handle the autofill button click event.
 */
async function handleAutofillButtonClick() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Execute the autofill script in the active job application tab
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["scripts/autofill.js"],
    });
}

/**
 * Handle the edit info button click event.
 */
function handleEditInfoButtonClick() {
    const width = 800;
    const height = 500;

    // Calculate the position to center the window
    const left = Math.round((window.screen.width - width) / 2);
    const top = Math.round((window.screen.height - height) / 2);

    // Open the info form in a new window
    chrome.windows.create({
        url: "../views/info-form.html",
        type: "popup",
        width,
        height,
        left,
        top,
    });
}

// Add event listeners to buttons
document.getElementById("btn--autofill-info").addEventListener("click", handleAutofillButtonClick);
document.getElementById("btn--edit-info").addEventListener("click", handleEditInfoButtonClick);
