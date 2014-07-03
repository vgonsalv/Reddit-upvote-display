safari.self.addEventListener("message", function(messageEvent) {
    if (messageEvent.name === "RUDOption") {
        RUDOption = JSON.parse(messageEvent.message);
        doUpvotes();
    }
}
, false);
safari.self.tab.dispatchMessage("getOption", null);
function getOptionURL() {
    return safari.extension.baseURI+"options.html";
}
function getIconURL() {
    return safari.extension.baseURI+"icon16.png";
}