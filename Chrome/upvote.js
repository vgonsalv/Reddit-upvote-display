function MidcolTag(midcolTag){
    this.tag = midcolTag;
    this.likeTag=midcolTag.children[3];
    this.unTag=midcolTag.children[2];
    this.disTag=midcolTag.children[1];
}
MidcolTag.prototype.setLikeContent= function(content){
    this.likeTag.innerHTML=content;
};
MidcolTag.prototype.setUnContent= function(content){
    this.unTag.innerHTML=content;
};
MidcolTag.prototype.setDisContent= function(content){
    this.disTag.innerHTML=content;
};
MidcolTag.prototype.setWidth= function(width){
    this.tag.style.width = width +'ex';
}

function DateTag(dateTag){
    this.tag = dateTag;
    this.text = dateTag.getElementsByTagName("span")[0];
    this.time = dateTag.getElementsByTagName("time")[0];
}
function ScoreTag(scoreTag){
    this.tag = scoreTag;
    this.numberTag = scoreTag.getElementsByClassName("number")[0];
    this.wordTag = scoreTag.getElementsByClassName("word")[0];
    this.likeText = scoreTag.textContent;
    
    this.score = this.numberTag.textContent;
    this.likes = (/.*\D+(\d+)%.*/).exec(this.likeText)[1];
}
ScoreTag.prototype.getScore = function(){
    return this.score;    
};
ScoreTag.prototype.getLikes = function(){
    return this.likes;    
};

function ShortlinkTag(shortlinkTag){
    this.tag = shortlinkTag;
    this.text = shortlinkTag.textContent;
    this.linkBox = document.getElementById("shortlink-text");
}
function InfoTag(info){
    this.tag = info;
    this.dateTag= new DateTag(info.getElementsByClassName("date")[0]);
    this.scoreTag = new ScoreTag(info.getElementsByClassName("score")[0]);
    this.shortlinkTag = new ShortlinkTag(info.getElementsByClassName("shortlink")[0]);
}
function Votes(up,down){
    this.up = up;
    this.down= down;
}


function findInfoTag(element){
    return new InfoTag(element.getElementsByClassName("linkinfo")[0]);
}
function findMidcolTag(element){
    var elems = element.getElementById("siteTable").getElementsByTagName("div");
    for(i in elems){
	if((" "+elems[i].className).indexOf(" midcol ")>-1){
	    return new MidcolTag(elems[i]);
	}
    }    
}

function getPage(url){
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false );
    xmlHttp.send( null );
    return new DOMParser().parseFromString(xmlHttp.response,"text/html");
}

function formatVotes(midcolTag,votes){
    adjustVotes(midcolTag,votes);
    midcolTag.setLikeContent('+' + (votes.up+1) + ' -' + votes.down);
    midcolTag.setUnContent('+' + votes.up + ' -' + votes.down);
    midcolTag.setDisContent('+' + votes.up + ' -' + (votes.down+1));

    var width = Math.ceil(Math.log(Math.max(votes.up+1,votes.down+1))/Math.LN10)+1;
    midcolTag.setWidth(width*1.5+'ex');
}

function calculateVotes(ScoreTag){
    var votes= new Votes();
    var percent = ScoreTag.getLikes()/100;
    var netVotes = ScoreTag.getScore();
    votes.up= Math.round(percent*netVotes/(2*percent-1));
    votes.down=Math.round(netVotes*(1-percent)/(2*percent-1));
    return votes;
}
function adjustVotes(midcolTag,votes){
    switch(midcolTag.tag.className){
    case "midcol likes":
	votes.up-=1; break;
    case "midcol unvoted": break;
    case "midcol dislikes":
	votes.down-=1; break;
    }
}


var midcolTag = findMidcolTag(document);
var infoTag = findInfoTag(document.body);
var votes=calculateVotes(infoTag.scoreTag)
formatVotes(midcolTag,votes);

