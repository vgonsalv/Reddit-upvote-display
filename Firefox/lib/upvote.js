var elems = document.getElementsByTagName('div'), i;
var re = /.*\D+(\d+)%.*/;
var midcolTag;
var likeTag;
var unTag;
var disTag;
var netVotes;
var percent;
alert('running');
for(i in elems){
    if((' '+elems[i].className ).indexOf(' midcol ') > -1){
	var subelems = elems[i].getElementsByTagName('div'),i;
	for(j in subelems){
	    if((' ' + subelems[j].className + ' ').indexOf(' score dislikes ') > -1){
		var midcolTag= elems[i];
		disTag = subelems[j];
	    }else if((' ' + subelems[j].className + ' ').indexOf(' score likes ') > -1)
		likeTag= subelems[j];
	    else if((' ' + subelems[j].className + ' ').indexOf(' score unvoted ') > -1)
		unTag = subelems[j];
	}
    }
    else if((' ' + elems[i].className + ' ').indexOf(' score ') > -1){
	var result=re.exec(elems[i].innerHTML);
	if(result!=null){
	    percent = result[1] /100;
	}
    }
}
netVotes = unTag.innerHTML;

var up = Math.round(percent*netVotes/(2*percent-1));
var down = Math.round(netVotes*(1-percent)/(2*percent-1));

likeTag.innerHTML = '+' + (up+1) +' -' +down;
unTag.innerHTML = '+' + up +' -' +down;
disTag.innerHTML = '+' + up +' -' + (down+1);

var width = Math.ceil(Math.log(Math.max(up+1,down+1))/Math.LN10)+1;
midcolTag.style.width=width*1.5+'ex';
