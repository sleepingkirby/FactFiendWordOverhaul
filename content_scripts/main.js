//loading external files and settings.
(function() {

/**
 * Check and set a global guard variable.
 * If this content script is injected into the same page again,
 * it will do nothing next time.
 */
  if (window.hasRun) {
  return true;
  }
window.hasRun = true;

/*----------------------------------------------
pre: none
post: none
returns true or false on the url depending if 
'on' is true and/or if the url is in the whitelist
or blacklist
----------------------------------------------*/
function runOnURL(url,on,wl,bl){
  if((on && !bl.hasOwnProperty(url))||wl.hasOwnProperty(url)){
  return true;
  }
return false;
}

//determins which 
function whichCap(word){
  
}

/*----------------------------------------------
pre: none
post: elements replaced
goes through all the elements and runs the replace
----------------------------------------------*/
function runReplace(allEls, words){
    allObjs.forEach((el) => {
    let txt=el.innerText;
      if(txt){
      //do replace.
        Object.keys(sttngs.words).forEach((word) => {
        //regex search
        txt.replace
        //determine case
        //
        });
      }
    }); 
}

/*----------------------------------------------
pre: none
post: runReplace()
switch for what to run on message from popup
----------------------------------------------*/
function runOnMsg(request, sender, sendResponse){
  switch(request.action){
    case 'replace':
      chrome.storage.local.get('words', (d) => {
      console.log('FactFiendWordOverhaul: running manual replace');
      runReplace(document.all, d['words']);
      });
    break;
    default:
    break;
  }
}


//main run
  chrome.storage.local.get(null, (d) => {
  let sttngs=d;
    if(Object.keys(d).length<=0){
    //initialize
    console.log("FactFiendWordOverhaul: initializing settings");
      const initObj={
      'on':true,
      'blacklist': {},
      'whitelist': {},
      'words': {
        'woke': 'challenging norms',
        'quiet quitting': 'performing to your pay'
        }
      }
    sttngs=initObj;
    chrome.storage.local.set(initObj);
    }

  let dmn=window.location.host;
    //if false, don't run.
    if(!runOnURL(dmn,settings.on,sttngs.whitelist,sttng,blacklist)){
    console.log("FactFiendWordOverhaul: not set to run");
    console.log("FactFiendWordOverhaul: set to run: "+sttngs.on);
    console.log("FactFiendWordOverhaul: domain in whitelist: "+sttngs.whilelist.hasOwnProperty(dmn));
    console.log("FactFiendWordOverhaul: domain in blacklist: "+sttngs.blacklist.hasOwnProperty(dmn));
    return false;
    }

    let allObjs=document.all;


  runReplace(allObjs,sttngs.words);
  chrome.storage.local.clear();
  });

  //listener for the popup signal
  chrome.runtime.onMessage.addListener(runOnMsg);
})();
