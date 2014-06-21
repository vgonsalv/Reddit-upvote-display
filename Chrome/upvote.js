function getVotes(url){
    var page = getPage(url);
    var tokens = parsePage(page);    
    return calculateVotes(tokens['netVotes'],tokens['percent']);  
}
function getPage(url){
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false );
    xmlHttp.send( null );
    return new DOMParser().parseFromString(xmlHttp.response,"text/html");
}
function parsePage(page){
    var result={};
    var elems = page.getElementsByTagName('div'), i;
    var re = /.*\D+(\d+)%.*/;
    for(i in elems){
	if((' '+elems[i].className ).indexOf(' midcol ') > -1){
	    var subelems = elems[i].getElementsByTagName('div'),i;
	    for(j in subelems){
		if((' ' + subelems[j].className + ' ').indexOf(' score dislikes ') > -1){
		    result['midcolTag']= elems[i];
		    result['disTag'] = subelems[j];
		}else if((' ' + subelems[j].className + ' ').indexOf(' score likes ') > -1)
		    result['likeTag']= subelems[j];
		else if((' ' + subelems[j].className + ' ').indexOf(' score unvoted ') > -1)
		    result['unTag'] = subelems[j];
	    }
	}
	else if((' ' + elems[i].className + ' ').indexOf(' score ') > -1){
	    var res=re.exec(elems[i].innerHTML);
	    if(res!=null){
		result['percent'] = res[1] /100;
	    }
	}
    }
    result['netVotes'] = result['unTag'].innerHTML;
    return result;
}
function formatVotes(midcolTag,likeTag,unTag,disTag,up,down){
    likeTag.innerHTML = '+' + (up+1) +' -' +down;
    unTag.innerHTML = '+' + up +' -' +down;
    disTag.innerHTML = '+' + up +' -' + (down+1);

    var width = Math.ceil(Math.log(Math.max(up+1,down+1))/Math.LN10)+1;
    midcolTag.style.width=width*1.5+'ex';
}

function calculateVotes(netVotes,percent){
    var votes= {};
    votes['up']= Math.round(percent*netVotes/(2*percent-1));
    votes['down']=Math.round(netVotes*(1-percent)/(2*percent-1));
    return votes;
}


var tokens =parsePage(document.body)
var votes= calculateVotes(tokens['netVotes'],tokens['percent']);
formatVotes(tokens['midcolTag'],tokens['likeTag'],tokens['unTag'],tokens['disTag'],votes['up'],votes['down']);

