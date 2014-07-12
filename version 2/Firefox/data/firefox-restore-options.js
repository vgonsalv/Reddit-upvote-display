self.port.on("options", function(ro) {
    RUDOption = JSON.parse(ro);
    doUpvotes();
});
window.addEventListener('message', function(event) {
    if(event.data &&event.data==="showOptions"){
        self.port.emit("showOptions","");
    }
}, false);
function addOptions(){
    var iconURL = self.options.iconURL;
    var head = document.getElementById("header-bottom-right");
    head.appendChild(create('<span class = "serparator">|</span>'+
                        '<img onclick ="window.postMessage(\'showOptions\','+
                        '\'*\')" src="'+iconURL+'"></a></span>'));
}

