//object that represents the arrows and the text between them
function MidcolTag(midcolTag) {
    this.tag = midcolTag;
    this.likeTag = midcolTag.children[3];
    this.unTag = midcolTag.children[2];
    this.disTag = midcolTag.children[1];
}
//setters for relevant properties
MidcolTag.prototype.setLikeContent = function(content) {
    this.likeTag.textContent = content;
};
MidcolTag.prototype.setUnContent = function(content) {
    this.unTag.textContent = content;
};
MidcolTag.prototype.setDisContent = function(content) {
    this.disTag.textContent = content;
};
MidcolTag.prototype.setWidth = function(width) {
    this.tag.style.width = width;
};

//represent the linkinfo box and import elements inside it
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

//get's the linkinfo box on the page
function findInfoTag(element) {
    return new InfoTag(element.getElementsByClassName("linkinfo")[0]);
}
//gets array of arrows from comments section
function findMidcolTag(element) {
    var elems = element.getElementById("siteTable").getElementsByTagName("div");
    for (i in elems) {
        if ((" " + elems[i].className).indexOf(" midcol ") > -1) {
            return new MidcolTag(elems[i]);
        }
    }
}
//gets all the links on the frontpage
function findLinkTags() {
    var table = document.getElementById("siteTable");
    var linkTags = table.getElementsByClassName("thing link");
    var links = [];
    for (var i = 0; i < linkTags.length; i++) {
        links.push(new LinkTag(linkTags[i]));
    }
    return links;
}
//clears expired entries to avoid running out of space
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
//checks to to see if entry is older than 5 minutes
function isExpired(data) {
    return false;//(new Date().getTime() - data.time) > 5 * 60 * 1000;
}
//gets link from cache if it is in it
function getCachedLink(shortLink) {
    var data = localStorage['rud_'+shortLink];
    if (!data)
        return undefined;
    else
        data = JSON.parse(data);
    if (isExpired(data)) {
        localStorage.removeItem('rud_'+shortLink);
        return null;
    }
    return data;
}
//adds  valid links to cache
function addCachedLink(shortlink, score, likes) {
    if(!score || !likes)
        return;
    var data = {time: new Date().getTime(), score: score, likes: likes};
    localStorage['rud_'+shortlink] = JSON.stringify(data);
}
//sends votes to server and adds to cache
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
//gets votes from server/cache
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
        xmlHttp.open("POST", "http://www.reddit-upvote-display.com/votecount", true);
        xmlHttp.setRequestHeader("Content-type", "text/plain");
        xmlHttp.send(JSON.stringify({action: "fetch", posts: toGet}));
    } else {
        cbk(have);
    }
}
//adds commas to a number
function numberWithCommas(x) {//thanks Elias Zamaria from SO
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/, ",");
}
//formats the vote data into the linkinfo box
function formatVotesLinkinfo(linkinfoTag, votes) {
    var uSpan = document.createElement("span");
    uSpan.className = "upvotes";
    uSpan.style.fontSize = "80%";
    uSpan.style.color= "orangered";
    
    var nSpan = document.createElement("span");
    nSpan.className = "number";
    nSpan.appendChild(document.createTextNode(votes.up));
    
    var wSpan = document.createElement("span");
    wSpan.className = "word";
    wSpan.appendChild(document.createTextNode("up votes"));
    
    uSpan.appendChild(nSpan);
    uSpan.appendChild(document.createTextNode(" "));
    uSpan.appendChild(wSpan);
    uSpan.appendChild(document.createTextNode(" "));
    
    var dSpan = document.createElement("span");
    dSpan.className = "downvotes";
    dSpan.style.fontSize = "80%";
    dSpan.style.color= "#5f99cf";
    
    nSpan = document.createElement("span");
    nSpan.className = "number";
    nSpan.appendChild(document.createTextNode(votes.down));
    
    wSpan = document.createElement("span");
    wSpan.className = "word";
    wSpan.appendChild(document.createTextNode("down votes"));
    
    dSpan.appendChild(nSpan);
    dSpan.appendChild(document.createTextNode(" "));
    dSpan.appendChild(wSpan);
    
    
    linkinfoTag.tag.insertBefore(uSpan, linkinfoTag.shortlinkTag.tag);
    linkinfoTag.tag.insertBefore(dSpan, linkinfoTag.shortlinkTag.tag);
}
//formats vote data between arrows
function formatVotesArrows(midcolTag, score, likes, rdo) {
    var adj = adjustVotes(midcolTag);
    var votes = format(score, likes, rdo, +1,adj);
    var len = Math.max(votes.up.toString().length, votes.down.toString().length);
    midcolTag.setLikeContent(votes.up + ' ' + votes.down);


    votes = format(score, likes, rdo ,0,adj);
    len = Math.max(len, votes.up.toString().length, votes.down.toString().length);
    midcolTag.setUnContent(votes.up + ' ' + votes.down);

    votes = format(score - 1, likes, rdo, -1 , adj);
    len = Math.max(len, votes.up.toString().length, votes.down.toString().length);
    midcolTag.setDisContent(votes.up + ' ' + votes.down);

    midcolTag.setWidth(Math.max(1.2 * len,5.1) + 'ex');
}
//calculates up/ddown votes from score/likes
function calculateVotes(score, percent) {
    var votes = new Votes();
    votes.up = Math.round(percent * score / (2 * percent - 1));
    votes.down = Math.round(score * (1 - percent) / (2 * percent - 1));
    return votes;
}
//determines users votes on the post
function adjustVotes(midcolTag) {
    switch (midcolTag.tag.className) {
        case "midcol likes":
            return  1;
        case "midcol unvoted":
            return 0;
        case "midcol dislikes":
            return -1;
    }
}
//regex to dermine if in comments based on the url 
function inComments() {
    return (/.*reddit.com\/r\/[^\/]+\/comments\/.*/).test(document.URL);
}
//formats the votes
function format(score, likes, rdo, adj1,adj2) {
    var final = new Votes("", "");
    if (rdo.range) {
        var upper = calculateVotes(score, (likes - -.5) / 100);
        var lower = calculateVotes(score, (likes - .5) / 100);
        if ( adj1&& adj1 > 0) {
            upper.up += 1;
            lower.up += 1;
        } else if (adj1&& adj1 < 0) {
            upper.down += 1;
            lower.down += 1;
        }
        if (adj2 && adj2 > 0) {
            upper.up -= 1;
            lower.up -= 1;
        } else if (adj2 && adj2 < 0) {
            upper.down -= 1;
            lower.down -= 1;
        }

        if (upper.up === lower.up) {
            final.up += (rdo.plusMinus ? '+' : '')
                    + (rdo.comma ? numberWithCommas(upper.up) : upper.up);
        } else {
            final.up = (rdo.plusMinus ? '+' : '')
                    + (rdo.comma ? numberWithCommas(Math.min(lower.up, upper.up)) : Math.min(lower.up, upper.up))
                    + ' - ' + (rdo.plusMinus ? '+' : '')
                    + (rdo.comma ? numberWithCommas(Math.max(lower.up, upper.up)) : Math.max(lower.up, upper.up));
        }
        if (upper.down === lower.down) {
            final.down += (rdo.plusMinus ? '-' : '')
                    + (rdo.comma ? numberWithCommas(upper.down) : upper.down);
        } else {
            final.down = (rdo.plusMinus ? '-' : '')
                    + (rdo.comma ? numberWithCommas(Math.min(lower.down, upper.down)) : Math.min(lower.down, upper.down))
                    + ' - ' + (rdo.plusMinus ? '-' : '')
                    + (rdo.comma ? numberWithCommas(Math.max(lower.down, upper.down)) : Math.max(lower.down, upper.down));
        }
    } else {
        var votes = calculateVotes(score, likes);
        if (adj1 && adj1 > 0) {
            votes.up += 1;
        } else if (adj1  && adj1 < 0) {
            votes.down += 1;
        }
        if (adj2 && adj2 > 0) {
            votes.up -= 1;
        } else if (adj2  && adj2 < 0) {
            votes.down -= 1;
        }
        final.up += (rdo.plusMinus ? '+' : '')
                + (rdo.comma ? numberWithCommas(votes.up) : votes.up);
        final.down += (rdo.plusMinus ? '-' : '')
                + (rdo.comma ? numberWithCommas(votes.down) : votes.down);
    }
    return final;
}

//method called to show everything on page
function doUpvotes() {
    refreshStorage();
    addOptions();//defined in <browser>-restore-options.js
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
                            var pSpan = document.createElement("span");
                            var tagLine = links[i].taglineTag;
                            tagLine.insertBefore(pSpan,tagLine.firstChild);
                            
                            var uSpan = document.createElement("span");
                            var dSpan = document.createElement("span");
                            
                            uSpan.style.color="#FF8B24";
                            dSpan.style.color="#9494FF";                            
                            
                            uSpan.textContent = votes.up;
                            dSpan.textContent = votes.down;
                            
                            pSpan.appendChild(document.createTextNode("("));
                            pSpan.appendChild(uSpan);
                            pSpan.appendChild(document.createTextNode("|"));
                            pSpan.appendChild(dSpan);
                            pSpan.appendChild(document.createTextNode(")"));
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
