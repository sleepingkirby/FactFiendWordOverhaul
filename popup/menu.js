
function reportErr(error){
console.error('' + error.message);
}

function onError(item){
console.log("Error: " + error);
var notif=document.getElementsByClassName('notify')[0];

}

function doNothing(item, err){

}

//gets hostname from url
function hostFromURL(str){
var rtrn=str;
var proto=rtrn.match(/^[a-z]+:\/\/+/g);
  if(proto==null){
  return false;
  }
rtrn=rtrn.substr(proto[0].length,rtrn.length);

var end=rtrn.search('/');
  if(end>=0){
  rtrn=rtrn.substr(0,end);
  }

return rtrn;
}

//to be used with getCurHost
function addDmnToLst(ps){
ps.sttngObj[ps.prop]=null;
  chrome.storage.local.get(null, (d)=>{
  d[ps.prop][ps.host]=null;
  console.log(d);
    chrome.storage.local.set(d,(b)=>{
    ps.updtFnc(d);
    });
  });
}

/*---------------------------------------------------------------------
pre: none 
post: updates chrome.storage.local
function to set up listeners for events.
---------------------------------------------------------------------*/
function startListen(){
var act=null;
  document.addEventListener("click", (e) => {
  act=e.target.getAttribute("act");
    switch(e.target.id){
      case 'settingsPage':
      chrome.runtime.openOptionsPage();     
      break;
      case 'About':
      chrome.tabs.create({url: 'https://www.patreon.com/untitledsidechannel'});
      break;
      case 'manualReplace':
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'replace'}, function(response){
        console.log(response);
        return true;
        });
      });
      break;
      default:
      break;
    }
  });
  document.addEventListener("input", (e) => {
  const act=e.target.getAttribute("act");
    switch(act){
      case 'lghtBttn':
        document.getElementById(e.target.getAttribute("for")).classList.add("onBttn");
      break;
      default:
      break;
    }
  });
  document.addEventListener("click", (e) => {
  const act=e.target.getAttribute("act");
  const prop=e.target.getAttribute("prop");
  const sttngObj={};
    switch(act){
      case "svTxtArea":
        let el=e.target;
        let taVal=document.getElementById(e.target.getAttribute('txtArea')).value;
        sttngObj[prop]=null;
          chrome.storage.local.get(sttngObj,(d)=>{
          d[prop]=strToHsh(taVal);
          console.log(d);
            chrome.storage.local.set(d,()=>{
            el.classList.remove("onBttn");
            });
          });
      break;
      case 'addCurDmn':
        //getting the current tab's domain can only be done through a promise. Will need it's own function
        getCurHost(addDmnToLst, {prop:prop, sttngObj:sttngObj, updtFnc:sttngsUpdtGUI});
        document.getElementById(e.target.getAttribute("bttn")).classList.add("onBttn");
      break;
      case 'sndRplcMsg':
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            //send message to page to set profile
            chrome.tabs.sendMessage(tabs[0].id, {action: 'replace'},(r)=>{
            console.log(r);
            });
        });
      break;
      default:
      break;
    }
  });
  document.addEventListener("change", (e) => {
  var prfl="";
  var dmn="";
  act=e.target.getAttribute("act");
    switch(act){
      case 'updtOn':
        chrome.storage.local.get({"on":null},(d)=>{
        d.on=document.getElementById("rplChck").checked;
        chrome.storage.local.set(d);
        });
      break;
      default:
      console.log(e.target);
      break;
    }
  });
}


//to be used with getCurHost below
function wrtToEl(ps){
  document.getElementById(ps.id).innerText=ps.host;
}

/*--------------------------------------
pre: hostFromUrl()
post: whatever cbFunc does
gets the host from the url of the current active tab
params:
lst=ignore list
cbFunc() Call back function
cbFuncPrms=should be an object
---------------------------------------*/
function getCurHost(fnc, fncPrms){
  chrome.tabs.query({active: true, currentWindow: true},(tabs) => {
  
  host=hostFromURL(tabs[0].url);
    if(host==false){
    host="Domain Not Applicable";
    }

  fncPrms["host"]=host;
  fnc(fncPrms);
  });
}

//convert string to hash obj
function strToHsh(str){
  if(typeof str !="string"){
  return null;
  }
var s=str;
var arr=s.trim().split("\n");
var rtrn={};
var max=arr.length;
  for(let i=0; i<max; i++){
  let pos=arr[i].indexOf("|");
    if(pos<=0){
    rtrn[arr[i]]=null;
    }
    else{
    rtrn[arr[i].substr(0,pos)]=arr[i].substr(pos+1);
    }
  }
return rtrn;
}

function hshToStr(hsh,valFlag=true){
  if(typeof hsh!="object"){
  return null;
  }
let rtrn="";
const keys=Object.keys(hsh);
  if(keys.length<=0){
  return null;
  }
  keys.forEach((key)=>{
    if(valFlag){
    rtrn+=key+"|"+hsh[key]+"\n";
    }
    else{
    rtrn+=key+"\n";
    }
  });
return rtrn.trim();
}


function sttngsUpdtGUI(d){
document.getElementById("rplChck").checked=d.on;
document.getElementById("bLst").value=hshToStr(d.blacklist, false);
document.getElementById("wLst").value=hshToStr(d.whitelist, false);
document.getElementById("wrdLst").value=hshToStr(d.words);

}

//================================ main ==========================
var host=""
//variable checks
chrome.storage.local.get( null,(d) => {

sttngsUpdtGUI(d);
getCurHost(wrtToEl, {id:'curDmn'});

startListen();
});
