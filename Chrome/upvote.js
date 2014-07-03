function MidcolTag(midcolTag) {
    this.tag = midcolTag;
    this.likeTag = midcolTag.children[3];
    this.unTag = midcolTag.children[2];
    this.disTag = midcolTag.children[1];
}
MidcolTag.prototype.setLikeContent = function(content) {
    this.likeTag.innerHTML = content;
};
MidcolTag.prototype.setUnContent = function(content) {
    this.unTag.innerHTML = content;
};
MidcolTag.prototype.setDisContent = function(content) {
    this.disTag.innerHTML = content;
};
MidcolTag.prototype.setWidth = function(width) {
    this.tag.style.width = width;
};

function DateTag(dateTag) {
    this.tag = dateTag;
    this.text = dateTag.getElementsByTagName("span")[0];
    this.time = dateTag.getElementsByTagName("time")[0];
}
function ScoreTag(scoreTag) {
    this.tag = scoreTag;
    this.numberTag = scoreTag.getElementsByClassName("number")[0];
    this.wordTag = scoreTag.getElementsByClassName("word")[0];
    this.likeText = scoreTag.textContent;

    this.score = this.numberTag.textContent.replace(/\D/, "");
    this.likes = (/.*\D+(\d+)%.*/).exec(this.likeText)[1];
}
ScoreTag.prototype.getScore = function() {
    return this.score;
};
ScoreTag.prototype.getLikes = function() {
    return this.likes;
};

function ShortlinkTag(shortlinkTag) {
    this.tag = shortlinkTag;
    this.text = shortlinkTag.textContent;
    this.linkBox = document.getElementById("shortlink-text");
}
function InfoTag(info) {
    this.tag = info;
    this.dateTag = new DateTag(info.getElementsByClassName("date")[0]);
    this.scoreTag = new ScoreTag(info.getElementsByClassName("score")[0]);
    this.shortlinkTag = new ShortlinkTag(info.getElementsByClassName("shortlink")[0]);
}
function Votes(up, down) {
    this.up = up;
    this.down = down;
}

function LinkTag(linkTag) {
    this.tag = linkTag;
    this.shortlink = (/t3_([a-z0-9]+)/).exec(linkTag.getAttribute("data-fullname"))[1];
    this.entryTag = linkTag.getElementsByClassName("entry")[0];
    this.taglineTag = this.entryTag.getElementsByClassName("tagline")[0];
    this.midcolTag = new MidcolTag(this.tag.getElementsByClassName("midcol")[0]);
}


function findInfoTag(element) {
    return new InfoTag(element.getElementsByClassName("linkinfo")[0]);
}
function findMidcolTag(element) {
    var elems = element.getElementById("siteTable").getElementsByTagName("div");
    for (i in elems) {
        if ((" " + elems[i].className).indexOf(" midcol ") > -1) {
            return new MidcolTag(elems[i]);
        }
    }
}
function findLinkTags() {
    var table = document.getElementById("siteTable");
    var linkTags = table.getElementsByClassName("thing link");
    var links = [];
    for (var i = 0; i < linkTags.length; i++) {
        links.push(new LinkTag(linkTags[i]));
    }
    return links;
}
function refreshStorage() {
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (!key||key.indexOf('rud_')!==0)
            return;
        var data = localStorage[key];
        if (isExpired(data)) {
            localStorage.removeItem(key);
        }
    }
}
function isExpired(data) {
    return (new Date().getTime() - data.time) > 5 * 60 * 1000;
}
function getCachedLink(shortLink) {
    var data = localStorage['rud_'+shortLink];
    if (data === undefined)
        return undefined;
    else
        data = JSON.parse(data);
    if (isExpired(data)) {
        localStorage.removeItem('rud_'+shortLink);
        return null;
    }
    return data;
}

function addCachedLink(shortlink, score, likes) {
    if(!score || !likes)
        return;
    var data = {time: new Date().getTime(), score: score, likes: likes};
    localStorage['rud_'+shortlink] = JSON.stringify(data);
}

function sendVotes(shortlink, infoTag) {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "http://www.reddit-upvote-display.com/votecount", true);
    xmlHttp.setRequestHeader("Content-type", "text/plain");
    var obj = {action: "add",
        posts: [
            {shortlink: shortlink, score: infoTag.scoreTag.getScore(), likes: infoTag.scoreTag.getLikes()}
        ]};
    xmlHttp.send(JSON.stringify(obj));
    addCachedLink(shortlink, infoTag.scoreTag.getScore(), infoTag.scoreTag.getLikes());
}
function getVotes(request, cbk) {
    var have = [];
    var toGet = [];
    for (var i in request) {
        var data = getCachedLink(request[i].shortlink);
        if (data) {
            have.push(data);
        } else {
            toGet.push(request[i]);
        }
    }
    if (toGet.length > 0) {
        var xmlHttp = null;
        xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                var data = JSON.parse(xmlHttp.responseText);
                var fullData = [];
                for (var i = 0, j = 0, k = 0; i < request.length; i++) {
                    if (j<toGet.length&&request[i].shortlink === toGet[j].shortlink) {
                        fullData[i] = data[j];
                        addCachedLink(toGet[j].shortlink, data[j].score, data[j].likes);
                        j++;
                    } else {
                        fullData[i] = have[k];
                        k++;
                    }
                }
                cbk(fullData);
            }
        };
        xmlHttp.open("POST", "http://www.reddit-upvote-display.com/votecount", false);
        xmlHttp.setRequestHeader("Content-type", "text/plain");
        xmlHttp.send(JSON.stringify({action: "fetch", posts: toGet}));
    } else {
        cbk(have);
    }
}

function create(htmlStr) {//thanks James from SO
    var frag = document.createDocumentFragment(),
            temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}
function numberWithCommas(x) {//thanks Elias Zamaria from SO
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/, ",");
}
function formatVotesLinkinfo(linkinfoTag, votes) {
    var toAdd = "<span class =\"upvotes\" style=\"font-size:80%;color:orangered;\">" +
            "<span class=\"number\">" + votes.up + "</span>&#32;" +
            "<span class=\"word\">up votes</span>&#32;" +
            "</span>" +
            "<span class =\"downvotes\" style=\"font-size:80%;color:#5f99cf;\">" +
            "<span class=\"number\">" + votes.down + "</span>&#32;" +
            "<span class=\"word\">down votes</span>" +
            "</span>";
    toAdd = create(toAdd);
    linkinfoTag.tag.insertBefore(toAdd, linkinfoTag.shortlinkTag.tag);
}
function formatVotesArrows(midcolTag, score, likes, rdo) {
    score = adjustVotes(midcolTag, score);
    var votes = format(score, likes, rdo, +1);
    var len = Math.max(votes.up.toString().length, votes.down.toString().length);
    midcolTag.setLikeContent(votes.up + ' ' + votes.down);


    votes = format(score, likes, rdo);
    len = Math.max(len, votes.up.toString().length, votes.down.toString().length);
    midcolTag.setUnContent(votes.up + ' ' + votes.down);

    votes = format(score - 1, likes, rdo, -1);
    len = Math.max(len, votes.up.toString().length, votes.down.toString().length);
    midcolTag.setDisContent(votes.up + ' ' + votes.down);

    midcolTag.setWidth(1.2 * len + 'ex');
}
function calculateVotes(score, percent) {
    var votes = new Votes();
    votes.up = Math.round(percent * score / (2 * percent - 1));
    votes.down = Math.round(score * (1 - percent) / (2 * percent - 1));
    return votes;
}
function adjustVotes(midcolTag, score) {
    switch (midcolTag.tag.className) {
        case "midcol likes":
            return score - 1;
        case "midcol unvoted":
            return score;
        case "midcol dislikes":
            return score + 1;
    }
}
function inComments() {
    return (/.*reddit.com\/r\/[^\/]+\/comments\/.*/).test(document.URL);
}
function format(score, likes, rdo, adjust) {
    var final = new Votes("", "");
    if (rdo.range) {
        var upper = calculateVotes(score, (likes - -.5) / 100);
        var lower = calculateVotes(score, (likes - .5) / 100);
        if (typeof adjust !== undefined && adjust > 0) {
            upper.up += 1;
            lower.up += 1;
        } else if (typeof adjust !== undefined && adjust < 0) {
            upper.down -= 1;
            lower.down -= 1;
        }

        if (upper.up === lower.up) {
            final.up += (rdo.plusMinus ? '+' : '')
                    + (rdo.comma ? numberWithCommas(final.up) : final.up);
        } else {
            final.up = (rdo.plusMinus ? '+' : '')
                    + (rdo.comma ? numberWithCommas(Math.min(lower.up, upper.up)) : Math.min(lower.up, upper.up))
                    + ' - ' + (rdo.plusMinus ? '+' : '')
                    + (rdo.comma ? numberWithCommas(Math.max(lower.up, upper.up)) : Math.max(lower.up, upper.up));
        }
        if (upper.down === lower.down) {
            final.down += (rdo.plusMinus ? '-' : '')
                    + (rdo.comma ? numberWithCommas(final.down) : final.down);
        } else {
            final.down = (rdo.plusMinus ? '-' : '')
                    + (rdo.comma ? numberWithCommas(Math.min(lower.down, upper.down)) : Math.min(lower.down, upper.down))
                    + ' - ' + (rdo.plusMinus ? '-' : '')
                    + (rdo.comma ? numberWithCommas(Math.max(lower.down, upper.down)) : Math.max(lower.down, upper.down));
        }
    } else {
        var votes = calculateVotes(score, likes);
        if (typeof adjust !== undefined && adjust > 0) {
            votes.up += 1;
        } else if (typeof adjust !== undefined && adjust < 0) {
            votes.down -= 1;
        }
        final.up += (rdo.plusMinus ? '+' : '')
                + (rdo.comma ? numberWithCommas(votes.up) : votes.up);
        final.down += (rdo.plusMinus ? '-' : '')
                + (rdo.comma ? numberWithCommas(votes.down) : votes.down);
    }
    return final;
}
function addOptions(){
    var url = chrome.extension.getURL("");
    var head = document.getElementById("header-bottom-right");
    head.appendChild(create('<span class = "serparator">|</span><span><a target="_blank" href="'
            +chrome.extension.getURL("options.html")+'"><img src="'+url+'icon16.png"”></a></span>'));
}

function doUpvotes() {
    refreshStorage();
    addOptions();
    if (inComments()) {
        if (RUDOption.comments.enabled) {
            var midcolTag = findMidcolTag(document);
            var infoTag = findInfoTag(document.body);
            if (infoTag.scoreTag.getLikes() !== 50) {
                if (RUDOption.comments.arrows.enabled) {
                    formatVotesArrows(midcolTag, infoTag.scoreTag.getScore(),
                            infoTag.scoreTag.getLikes(), RUDOption.comments.arrows);
                }
                if (RUDOption.comments.linkinfo.enabled) {
                    formatVotesLinkinfo(infoTag,
                            format(infoTag.scoreTag.getScore(), infoTag.scoreTag.getLikes(),
                                    RUDOption.comments.linkinfo));

                }
                var unparsed_link = infoTag.shortlinkTag.linkBox.getAttribute("value");
                var result = (/http:\/\/redd.it\/([a-z0-9]+)/).exec(unparsed_link);
                var shortlink = result[1];
                sendVotes(shortlink, infoTag);
            }
        }
    } else {
        if (RUDOption.frontpage.enabled) {
            var links = findLinkTags();
            var shortlinks = [];
            for (i in links) {
                shortlinks[i] = {shortlink: links[i].shortlink};
            }
            getVotes(shortlinks, function(voteInfo) {
                for (var i in links) {
                    if (voteInfo[i].score !== null &&
                            voteInfo[i].score !== 0 &&
                            voteInfo[i].likes !== 50) {
                        if (RUDOption.frontpage.res.enabled) {
                            var votes = format(voteInfo[i].score, voteInfo[i].likes, RUDOption.frontpage.res);
                            var span = '<span>(' +
                                    '<span style="color:#FF8B24">' + votes.up + '</span>|' +
                                    '<span style="color:#9494FF">' + votes.down + '</span>' +
                                    ')</span>';
                            links[i].taglineTag.innerHTML = span + links[i].taglineTag.innerHTML;
                        }
                        if (RUDOption.frontpage.arrows.enabled) {
                            formatVotesArrows(links[i].midcolTag, voteInfo[i].score,
                                    voteInfo[i].likes, RUDOption.frontpage.arrows);
                        }
                    }
                }
            });
        }
    }
}
doUpvotes();

