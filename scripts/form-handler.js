import { base64ToFile, fileToBase64 } from "../utils/helpers.js";

// Function to populate form with saved data
function populateFormWithSavedData() {
    chrome.storage.local.get((items) => {
        if (!items.info) return;

        const info = items.info;
        const form = document.getElementById("form--info-form");
        const inputs = form.querySelectorAll("input");
        inputs.forEach((input) => {
            if (input.type === "file") {
                const { base64, name, type } = info[input.name];
                const file = base64ToFile(base64, name, type);
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                input.files = dataTransfer.files;
            } else {
                input.value = info[input.name] || "";
            }
        });
    });
}

// Function to save form data to chrome.storage.local
async function saveFormData(e) {
    e.preventDefault();

    // Extract form data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Handle file inputs separately
    const fileInputs = e.target.querySelectorAll('input[type="file"]');
    for (const input of fileInputs) {
        const file = formData.get(input.name);
        if (file && file.size > 0) {
            const base64 = await fileToBase64(file);
            data[input.name] = { base64, name: file.name, type: file.type };
        }
    }

    // Save data to chrome.storage.local
    chrome.storage.local.set({ info: data });

    // Close the window
    window.close();
}

// Event listener for window load to populate form
window.addEventListener("load", populateFormWithSavedData);

// Event listener for form submit to save data
document.getElementById("form--info-form").addEventListener("submit", saveFormData);
