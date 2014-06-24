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


function sendVotes(shortlink, infoTag) {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "http://redditupvotedisplay-env.elasticbeanstalk.com/votecount", true);
    xmlHttp.setRequestHeader("Content-type", "text/plain");
    var obj = {action: "add",
        posts: [
            {shortlink: shortlink, score: infoTag.scoreTag.getScore(), likes: infoTag.scoreTag.getLikes()}
        ]};
    xmlHttp.send(JSON.stringify(obj));
}
function getVotes(request) {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "http://redditupvotedisplay-env.elasticbeanstalk.com/votecount", false);
    xmlHttp.setRequestHeader("Content-type", "text/plain");
    xmlHttp.send(JSON.stringify(request));
    var data = JSON.parse(xmlHttp.responseText);
    var voteData = [];
    for (var i = 0; i < request.posts.length; i++) {
        if (data[i].score !== null) {
            var votes = calculateVotes(data[i].score, data[i].likes / 100);
            voteData[i] = votes;
        }else{
            voteData[i] = new Votes("?","?");
        }
    }
    return voteData;
}
function getPage(url) {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false);
    xmlHttp.send(null);
    return new DOMParser().parseFromString(xmlHttp.response, "text/html");
}

function formatVotes(midcolTag, votes) {
    adjustVotes(midcolTag, votes);
    midcolTag.setLikeContent('+' + (votes.up + 1) + ' -' + votes.down);
    midcolTag.setUnContent('+' + votes.up + ' -' + votes.down);
    midcolTag.setDisContent('+' + votes.up + ' -' + (votes.down + 1));

    var width = Math.ceil(Math.log(Math.max(votes.up + 1, votes.down + 1)+.1) / Math.LN10) + 1;
    midcolTag.setWidth(width * .9 + 'em');
}

function calculateVotes(score, percent) {
    var votes = new Votes();
    votes.up = Math.round(percent * score / (2 * percent - 1));
    votes.down = Math.round(score * (1 - percent) / (2 * percent - 1));
    return votes;
}
function adjustVotes(midcolTag, votes) {
    switch (midcolTag.tag.className) {
        case "midcol likes":
            votes.up -= 1;
            break;
        case "midcol unvoted":
            break;
        case "midcol dislikes":
            votes.down -= 1;
            break;
    }
}
function inComments() {
    return (/.*reddit.com\/r\/[^\/]+\/comments\/.*/).test(document.URL);
}

if (inComments()) {
    var midcolTag = findMidcolTag(document);
    var infoTag = findInfoTag(document.body);
    if (infoTag.scoreTag.getLikes() !== 50) {
        var votes = calculateVotes(infoTag.scoreTag.getScore(), infoTag.scoreTag.getLikes() / 100);
        formatVotes(midcolTag, votes);
        var unparsed_link = infoTag.shortlinkTag.linkBox.getAttribute("value");
        var result = (/http:\/\/redd.it\/([a-z0-9]+)/).exec(unparsed_link);
        var shortlink = result[1];
        sendVotes(shortlink, infoTag);
    }
} else {
    var links = findLinkTags();
    var shortlinks = [];
    for (i in links) {
        shortlinks[i] = {shortlink: links[i].shortlink};
    }
    var request = {action: "fetch", posts: shortlinks};
    var voteInfo = getVotes(request);
    for(i in shortlinks){
        links[i].tag.setAttribute("data-ups",voteInfo[i].up);
        links[i].tag.setAttribute("data-downs",voteInfo[i].down);
    }
}

