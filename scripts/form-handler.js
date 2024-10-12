/**
 * Converts a file to a base64 string.
 *
 * @param {File} file The file to convert
 * @returns {Promise<string>} The base64 string
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}

/**
 * Convert base64 string to File object
 *
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
 * Populate the input field with the saved data.
 *
 * @param {HTMLInputElement} input The input field
 * @param {Object} info The saved data
 * @returns {void}
 */
function populateInputField(input, info) {
    if (input.type === "file") {
        const { base64, name, type } = info[input.name];
        const file = base64ToFile(base64, name, type);
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
    } else {
        input.value = info[input.name] || "";
    }
}

/**
 * Populate the form with the user's saved information.
 */
function populateFormWithSavedData() {
    chrome.storage.local.get((items) => {
        if (!items.info) return;

        const info = items.info;
        const form = document.getElementById("form--info-form");
        const inputs = form.querySelectorAll("input");
        inputs.forEach((input) => populateInputField(input, info));
    });
}

/**
 * Handle file inputs in the form.
 *
 * @param {NodeListOf<HTMLInputElement>} fileInputs The file input fields
 * @param {FormData} formData The form data
 * @param {Object} data The data object
 * @returns {Promise<void>}
 */
async function handleFileInputs(fileInputs, formData, data) {
    for (const input of fileInputs) {
        const file = formData.get(input.name);
        if (file && file.size > 0) {
            const base64 = await fileToBase64(file);
            data[input.name] = { base64, name: file.name, type: file.type };
        }
    }
}

/**
 * Save the form data to the local storage.
 *
 * @param {Event} e The form submit event
 * @returns {Promise<void>}
 */
async function saveFormData(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const fileInputs = e.target.querySelectorAll('input[type="file"]');
    await handleFileInputs(fileInputs, formData, data);

    chrome.storage.local.set({ info: data });

    window.close();
}

// Add event listeners
window.addEventListener("load", populateFormWithSavedData);
document.getElementById("form--info-form").addEventListener("submit", saveFormData);
