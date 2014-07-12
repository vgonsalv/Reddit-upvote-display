chrome.storage.sync.get(RUDOption, function(ro) {
    RUDOption = ro;
    doUpvotes();
});
function addOptions(){
    var head = document.getElementById("header-bottom-right");
    var s = document.createElement("span");
    s.className = "serparator";
    s.appendChild(document.createTextNode("|"));
    
    head.appendChild(s);
    
    s = document.createElement("span");
    var a = document.createElement("a");
    a.href = chrome.extension.getURL("options.html");
    a.setAttribute("target","_blank");
    
    var i = document.createElement("img");
    i.src = chrome.extension.getURL("icon16.png");
    
    a.appendChild(i);
    s.appendChild(a);
    head.appendChild(s);
}