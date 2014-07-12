window.addEventListener("load",foo);
chrome.storage.sync.get(RUDOption, function(ro) {
    RUDOption = ro;
    doUpvotes();
});
$(window).on("neverEndingLoad",foo);
function addOptions(){
    var iconURL = chrome.extension.getURL("icon16.png");
    var optionURL = chrome.extension.getURL("options.html");
    var head = document.getElementById("header-bottom-right");
    head.appendChild(create('<span class = "serparator">|</span><span><a target="_blank" href="'
            +optionURL+'"><img src="'+iconURL+'"></a></span>'));
}
function foo(e){
    console.log("foo");
    if(e){
        console.log(e);
    }
}