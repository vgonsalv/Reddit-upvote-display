chrome.runtime.onMessageExternal.addListener(foo);
chrome.runtime.onConnectExternal.addListener(foo);
function foo(e){
    console.log("foo");
    if(e){
        console.log(e);
    }
}