
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
      case 'replace':
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'fillForm', msg:{val:document.getElementById("prflSlct").value}});
      });
      /*
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'disableMdl'});
        });
      */
      break;
      default:
      break;
    }
  });
  document.addEventListener("key", (e) => {
  const act=e.target.getAttribute("act");
    switch(act){
      default:
      break;
    }
  });
  document.addEventListener("click", (e) => {
  const act=e.target.getAttribute("act");
    switch(act){
      case "svTxtArea":
        const el=e.target;
        const sttngObj={};
        const prop=e.target.getAttribute("prop");
        const taVal=document.getElementById(e.target.getAttribute('txtArea')).value;
        sttngObj[prop]=null;
          chrome.storage.local.get(sttngObj,(d)=>{
          d[prop]=strToHsh(taVal);
          console.log(d);
            chrome.storage.local.set(d,()=>{
            el.classList.remove("onBttn");
            });
          });
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
      case 'lghtBttn':
        document.getElementById(e.target.getAttribute("for")).classList.toggle("onBttn");
      break;
      case 'setPgPrfl':
        chrome.storage.local.get({"settings":null}, (d)=>{
          chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            //send message to page to set profile
            chrome.tabs.sendMessage(tabs[0].id, {action: 'setPgPrfl', msg:{val:e.target.value}},(r)=>{
              if(r){
              d.settings.cur_profile=e.target.value;
              //send message to background to set the contextmenu for which profile to set up for user to paste from
              chrome.runtime.sendMessage({'setPrfl':e.target.value});
              chrome.storage.local.set(d);
              }
            });
          });
        });
      break;
      case 'addDmnIgnr':
      dmn=document.getElementById("dmn");
        chrome.storage.local.get({"settings":null}, (d)=>{
          if(e.target.checked){
            if(d.settings.ignrLst.trim()==""){
            d.settings.ignrLst=dmn.textContent;
            }
            else{
            d.settings.ignrLst+="\n"+dmn.textContent;
            }
          chrome.storage.local.set(d);
          }
          else{
            if(d.settings.ignrLst.indexOf("\n"+dmn.textContent)>=0){
            d.settings.ignrLst=d.settings.ignrLst.replace("\n"+dmn.textContent,"");
            chrome.storage.local.set(d);
            }
            else if(d.settings.ignrLst.indexOf(dmn.textContent)>=0){
            d.settings.ignrLst=d.settings.ignrLst.replace(dmn.textContent,"").trim();
            chrome.storage.local.set(d);
            }
          }
        });
      break;
      case 'addDmnApply':
      prfl=document.getElementById("prflSlct");
      dmn=document.getElementById("dmn");
        chrome.storage.local.get({"settings":null}, (d)=>{
        let aHsh=strToApplyLst(d.settings.applyLst);
          if(e.target.checked){
            if(d.settings.applyLst.trim()==""){
            d.settings.applyLst=dmn.textContent+"|"+prfl.value;
            }
            else{
            d.settings.applyLst+="\n"+dmn.textContent+"|"+prfl.value;
            }
          chrome.storage.local.set(d);
          }
          else{
            if(!aHsh.hasOwnProperty(dmn.textContent)){
            return false;
            }
            if(d.settings.applyLst.indexOf("\n"+dmn.textContent+"|"+aHsh[dmn.textContent])>=0){
            d.settings.applyLst=d.settings.applyLst.replace("\n"+dmn.textContent+"|"+aHsh[dmn.textContent],"");
            chrome.storage.local.set(d);
            }
            else if(d.settings.applyLst.indexOf(dmn.textContent+"|"+aHsh[dmn.textContent])>=0){
            d.settings.applyLst=d.settings.applyLst.replace(dmn.textContent+"|"+aHsh[dmn.textContent],"").trim();
            chrome.storage.local.set(d);
            }
          }
        });
      break;
      case 'tglCurDef':
        chrome.storage.local.get({"settings":null},(d)=>{
        d.settings.curDef=document.getElementById("curDefId").checked;
          if(!e.target.checked){
          d.settings.cur_profile=d.settings.def_profile;
          chrome.runtime.sendMessage({'setPrfl':d.settings.def_profile});
          }
        chrome.storage.local.set(d);
        });
      break;
      case 'fPnl':
          chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'fPnlTgl', msg:{val:e.target.checked}});
          });
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

function hshToStr(hsh){
  if(typeof hsh!="object"){
  return null;
  }
let rtrn="";
  Object.keys(hsh).forEach((key)=>{
  rtrn+="key"+"|"+hsh[key]+"\n";
  });
return rtrn;
}


function sttngsUpdtGUI(d){
document.getElementById("rplChck").checked=d.on;
document.getElementById("bLst").value=hshToStr(d.blackList);

}

//================================ main ==========================
var host=""
/*
var ignrHsh={};
var applyHsh={};
var curPrfl=null;
*/

//variable checks
chrome.storage.local.get( null,(d) => {

sttngsUpdtGUI(d);
getCurHost(wrtToEl, {id:'curDmn'});

/*
var af=document.getElementById("atFllId");
af.checked=d.settings.autoFill;

var ef=document.getElementById("evntFllId");
ef.checked=d.settings.eventFill;

var hov=document.getElementById("hvrId");
hov.checked=d.settings.hoverId;

var hov=document.getElementById("fPnlId");
hov.checked=d.settings.floatPnl;

var curDef=document.getElementById("curDefId");
curDef.checked=d.settings.curDef;
*/

//fill div with domain and the buttons that match
//getCurHost(populDmn, {id:"dmn", ignrId:"dmnTypeIgnr", applyId:"dmnTypeApply", "d":d});

/*
  //figure out what profile to have in the profiles drop down as well as fill the drop down. 
  chrome.tabs.query({active: true, currentWindow: true},(tabs) => {
    if(tabs[0].url.indexOf("chrome")!=0){

    let h=hostFromURL(tabs[0].url);
    let aHsh=strToApplyLst(d.settings.applyLst);
    
      chrome.tabs.sendMessage(tabs[0].id, {action: 'getPgPrfl', msg:{}}, function(e){
      chromeSendMsgErrHndl("getPgPrfl", tabs);
      curPrfl=dtrmnPrfl(d.settings.cur_profile, d.settings.def_profile, h, aHsh, e, d.profiles, d.settings.curDef);

      fillSlct("prflSlct", Object.keys(d.profiles),curPrfl); 
      });
    }
  });
*/


startListen();
});
