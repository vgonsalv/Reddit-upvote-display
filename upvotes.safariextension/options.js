function create(htmlStr) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}
function RUDDisplayOption() {
    this.enabled = true;
    this.plusMinus = true;
    this.comma = true;
    this.range = true;
    this.overRES = true;
    return this;
}

function RUDCreateDisplayOptionHTML(id, name){
    var fragment ="<div><label>"+
                    "<input type='checkbox' id='rud_"+id+"' />"+
                    "Display upvotes/downvotes in "+name+
                "</label>"+
                "<br />"+
                "<div>"+
                    "<label><input type='checkbox' id='rud_"+id+"_plusMinus' />"+
                        "Display +/-"+
                    "</label>"+
                    "<br />"+
                    "<label><input type='checkbox' id='rud_"+id+"_comma' />"+
                        "Display comma separator"+
                    "</label>"+
                    "<br />"+
                    "<label><input type='checkbox' id='rud_"+id+"_range' />"+
                        "Display as range"+
                    "</label>"+
                "</div></div>";
    return create(fragment);
}
function RUDCreateOptionHTML(){
    var tag = document.getElementById("rud_comments").parentNode.parentNode;
    tag.appendChild(RUDCreateDisplayOptionHTML("comments_linkinfo","link-info"));
    tag.appendChild(RUDCreateDisplayOptionHTML("comments_arrows","between arrows"));
    var tag = document.getElementById("rud_frontpage").parentNode.parentNode;
    tag.appendChild(RUDCreateDisplayOptionHTML("frontpage_res","RES's (?|?)"));
    tag.appendChild(RUDCreateDisplayOptionHTML("frontpage_arrows","between arrows"));
}
function RUDOption() {
    this.comments = {enabled:true,linkinfo: new RUDDisplayOption(),
        arrows: new RUDDisplayOption()};
    this.frontpage = {enabled:true,res: new RUDDisplayOption(),
        arrows: new RUDDisplayOption()};
    return this;
}
function restoreRUDDisplayOption(id,rdo){
    document.getElementById(id).checked=rdo.enabled;
    document.getElementById(id +"_plusMinus").checked=rdo.plusMinus;
    document.getElementById(id+"_comma").checked = rdo.comma;
    document.getElementById(id+"_range").checked = rdo.range;
}
function restoreRUDOption(){
    document.getElementById("rud_comments").checked = RUDOption.comments.enabled;
    restoreRUDDisplayOption("rud_comments_linkinfo", RUDOption.comments.linkinfo );
    restoreRUDDisplayOption("rud_comments_arrows",RUDOption.comments.arrows);
    document.getElementById("rud_frontpage").checked = RUDOption.frontpage.enabled;
    restoreRUDDisplayOption("rud_frontpage_res",RUDOption.frontpage.res);
    restoreRUDDisplayOption("rud_frontpage_arrows",RUDOption.frontpage.arrows);
}
function parseRUDDisplayOption(id){
    var opt = new RUDDisplayOption();
    opt.enabled = document.getElementById(id).checked;
    opt.plusMinus = document.getElementById(id +"_plusMinus").checked;
    opt.comma = document.getElementById(id+"_comma").checked;
    opt.range = document.getElementById(id+"_range").checked;
    return opt;
}
function parseRUDOption(){
    RUDOption.comments.enabled= document.getElementById("rud_comments").checked;
    RUDOption.comments.linkinfo = parseRUDDisplayOption("rud_comments_linkinfo");
    RUDOption.comments.arrows = parseRUDDisplayOption("rud_comments_arrows");
    RUDOption.frontpage.enabled= document.getElementById("rud_frontpage").checked;
    RUDOption.frontpage.res = parseRUDDisplayOption("rud_frontpage_res");
    RUDOption.frontpage.arrows = parseRUDDisplayOption("rud_frontpage_arrows");
    return RUDOption;    
}
var RUDOption = new RUDOption();