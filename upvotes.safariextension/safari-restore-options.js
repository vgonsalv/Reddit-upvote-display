safari.self.addEventListener("message", function(messageEvent) {
    if (messageEvent.name === "RUDOption") {
        RUDOption = JSON.parse(messageEvent.message);
        doUpvotes();
    }
}
, false);
safari.self.tab.dispatchMessage("getOption", null);
function addOptions(){
    var iconURL = safari.extension.baseURI+"icon16.png";
    var optionURL = safari.extension.baseURI+"options.html";
    var head = document.getElementById("header-bottom-right");
    head.appendChild(create('<span class = "serparator">|</span><span><a target="_blank" href="'
            +optionURL+'"><img src="'+iconURL+'"></a></span>'));
}