chrome.storage.sync.get(RUDOption, function(ro) {
    RUDOption = ro;
    doUpvotes();
});
function getOptionURL() {
    return chrome.extension.getURL("options.html");
}
function getIconURL() {
    return chrome.extension.getURL("icon16.png");
}