function save_options() {
    parseRUDOption();
    window.postMessage(JSON.stringify(RUDOption),"*");
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
        status.textContent = '';
    }, 750);
}
document.addEventListener("DOMContentLoaded", RUDCreateOptionHTML);
document.getElementById('save').addEventListener('click',
        save_options);


