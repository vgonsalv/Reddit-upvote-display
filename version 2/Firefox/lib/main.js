var pageMod = require("sdk/page-mod");
var self = require("sdk/self");
var prefs = require("sdk/simple-prefs").prefs;
if (prefs.RUDOption === "")
    prefs.RUDOption = '{"comments":{"enabled":true,"linkinfo":{"enabled":true,"plusMinus":true,"comma":true,"range":true,"overRES":true},"arrows":{"enabled":true,"plusMinus":true,"comma":true,"range":true,"overRES":true}},"frontpage":{"enabled":true,"res":{"enabled":true,"plusMinus":true,"comma":true,"range":true,"overRES":true},"arrows":{"enabled":true,"plusMinus":true,"comma":true,"range":true,"overRES":true}}}';

pageMod.PageMod({
    include: /.*reddit.com\/.*/,
    contentScriptFile: [
        self.data.url("options.js"),
        self.data.url("upvote.js"),
        self.data.url("firefox-restore-options.js")
    ],
    onAttach: function(worker) {
        worker.port.emit("options", prefs.RUDOption);
        worker.port.on("showOptions", function(message) {
            console.log("main.js" + message);
            require("sdk/tabs").open(self.data.url("options.html"));
        });
    },
    contentScriptOptions: {
        pageURL: self.data.url("options.html"),
        iconURL: self.data.url("icon16.png")
    }
});
pageMod.PageMod({
    include: "resource://com-dot-reddit-upvote-display-at-jetpack/upvote/data/options.html",
    contentScriptFile: [
        self.data.url("options.js"),
        self.data.url("saveRelay.js")
    ],
    onAttach: function(worker) {
        worker.port.emit("options", prefs.RUDOption);
        worker.port.on("saveOptions", function(message) {
            prefs.RUDOption = message;
        });
    }
});