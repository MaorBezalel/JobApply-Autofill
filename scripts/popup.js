/**
 *
 * @param {HTMLInputElement} inputField
 */
function getInputFieldAttributesThatWillBeChecked(inputField) {
    return {
        id: inputField.id ? inputField.id.toLowerCase() : undefined,
        name: inputField.name ? inputField.name.toLowerCase() : undefined,
        placeholder: inputField.placeholder ? inputField.placeholder.toLowerCase() : undefined,
        ariaLabel: inputField.ariaLabel ? inputField.ariaLabel.toLowerCase() : undefined,
        label: inputField.labels
            ? inputField.labels[0].textContent.replace("\n", "").trim().toLowerCase()
            : undefined,
        dataField: inputField.dataset.field ? inputField.dataset.field.toLowerCase() : undefined,
        autoComplete: inputField.autocomplete ? inputField.autocomplete.toLowerCase() : undefined,
    };
}

document.getElementById("btn--autofill-info").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["scripts/autofill.js"],
    });
});

document.getElementById("btn--edit-info").addEventListener("click", () => {
    chrome.windows.create({
        url: "../views/info-form.html",
        type: "popup", // TODO: check out "panel" type
        width: 600,
        height: 600,
    });
});
