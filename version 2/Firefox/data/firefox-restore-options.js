self.port.on("options", function(ro) {
    RUDOption = JSON.parse(ro);
    doUpvotes();
});
function addOptions(){
    var head = document.getElementById("header-bottom-right");
    var s = document.createElement("span");
    s.className = "serparator";
    s.appendChild(document.createTextNode("|"));
    
    head.appendChild(s);
    
    s = document.createElement("span");
    
    var i = document.createElement("img");
    i.src =  self.options.iconURL;
    i.onclick= function(){
        self.port.emit("showOptions","");
    };
    
    s.appendChild(i);
    head.appendChild(s);
}

