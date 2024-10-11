// Listener for when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
    // Check if the URL is valid and not a `chrome://` URL
    if (tab.url && !tab.url.startsWith("chrome://")) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                console.log("Extension is now active on this page!");
                alert("Extension is now active on this page!");
            },
        });
    }
});

chrome.contextMenus.create({
    id: "sampleContextMenu",
    title: "Sample Context Menu",
    contexts: ["action"],
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
    chrome.windows.create({
        url: "index.html",
        type: "popup",
        width: 800,
        height: 600,
    });
});
