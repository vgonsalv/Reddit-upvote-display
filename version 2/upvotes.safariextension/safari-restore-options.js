safari.self.addEventListener("message", function(messageEvent) {
    if (messageEvent.name === "RUDOption") {
        RUDOption = JSON.parse(messageEvent.message);
        doUpvotes();
    }
}
, false);
safari.self.tab.dispatchMessage("getOption", null);
function addOptions(){
    var head = document.getElementById("header-bottom-right");
    var s = document.createElement("span");
    s.className = "serparator";
    s.appendChild(document.createTextNode("|"));
    
    head.appendChild(s);
    
    s = document.createElement("span");
    var a = document.createElement("a");
    a.href = safari.extension.baseURI+"options.html";
    a.setAttribute("target","_blank");
    
    var i = document.createElement("img");
    i.src = safari.extension.baseURI+"icon16.png";
    
    a.appendChild(i);
    s.appendChild(a);
    head.appendChild(s);
}