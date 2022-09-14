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

    allObjs.forEach((el) => {
      if(el.innerText){
      //do replace.
        Object.keys(sttngs.words).forEach((word) => {
        //regex search
        //determine case
        //
        });
      }
    });
  });


chrome.storage.local.clear();

})();
