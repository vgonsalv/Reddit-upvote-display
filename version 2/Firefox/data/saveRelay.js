window.addEventListener('message', function(event) {
    if (event&&event.data && JSON.parse(event.data)) {        
        self.port.emit("saveOptions", event.data);
    }
}, false);
self.port.on("options", function(ro) {
    RUDOption = JSON.parse(ro);
    restoreRUDOption();
});




