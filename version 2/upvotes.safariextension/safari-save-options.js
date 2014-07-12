
function save_options() {
    parseRUDOption();

    safari.self.tab.dispatchMessage("setOption", JSON.stringify(RUDOption));
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
        status.textContent = '';
    }, 750);
}


function restore_options() {
    safari.self.tab.dispatchMessage("getOption", null);
    safari.self.addEventListener("message", function(messageEvent) {
        if (messageEvent.name === "RUDOption") {
            RUDOption = JSON.parse(messageEvent.message);
            restoreRUDOption();
        }
    }, false);
}
document.addEventListener("DOMContentLoaded", RUDCreateOptionHTML);
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
        save_options);