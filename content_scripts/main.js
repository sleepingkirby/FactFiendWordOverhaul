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

const tagList={
'a': true,
'article': true,
'aside': true,
'button': true,
'div':true,
'em': true,
'figcaption': true,
'footer': true,
'h1': true,
'h2': true,
'h3': true,
'h4': true,
'label': true,
'li': true,
'link': true,
'p': true,
'span': true,
'title': true
}

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

//determines which capitalization
function whichCap(word){
let capLen=0;
let capEnd=false;
  for(let i=0; i<3; i++){
    if(/\p{Lu}/u.test(word[i])){
    capLen++;
    }
  }
  if(/\p{Lu}/u.test(word[word.length-1])){
  capEnd=true;
  }
  //no cap
  if(capLen==0){
  return "none";
  }
  if(capLen>1&&capEnd){
  return "allcap";
  }
  return "firstcap";
}


function capWordToStyl(word, style){
  switch(style){
    case "allcap":
    return word.toLocaleUpperCase();
    case "firstcap":
    return word[0].toLocaleUpperCase()+word.substr(1,word.length);
    break;
    default:
    return word;
    break;
  }
}

/*----------------------------------------------
pre: none
post: elements replaced
goes through all the elements and runs the replace
----------------------------------------------*/
function runReplace(allEls, words){
let list={};
  for(const el of allEls){
  let txt=el.innerHTML;
    if(tagList.hasOwnProperty(el.tagName.toLocaleLowerCase())&&txt){
    //do replace.
      Object.keys(words).forEach((word) => {
      //regex search
        if(txt.includes(word)){
        const re=new RegExp(word, "gi");
          const newTxt=txt.replace(re, (wrd) => {
          return capWordToStyl(words[word],whichCap(wrd));
          });
        el.innerHTML=newTxt;
        }
      });
    }
  }
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

/*--------------------------
pre: none
post: none
new fangled wait function 
https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
---------------------------*/
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/*-----------------------
pre: pageDone()
post: none
runs pageDone after "secs" amount of time
-----------------------*/
async function delayRun(secs=6500, allObjs, sttngs) {
await sleep(secs);
runReplace(allObjs,sttngs.words);
}



//main run
console.log("================= FactFiend==========>>");
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
    if(!runOnURL(dmn,sttngs.on,sttngs.whitelist,sttngs.blacklist)){
    console.log("FactFiendWordOverhaul: not set to run");
    console.log("FactFiendWordOverhaul: set to run: "+sttngs.on);
    console.log("FactFiendWordOverhaul: domain in whitelist: "+sttngs.whilelist.hasOwnProperty(dmn));
    console.log("FactFiendWordOverhaul: domain in blacklist: "+sttngs.blacklist.hasOwnProperty(dmn));
    return false;
    }

  let allObjs=document.all;

  runReplace(allObjs,sttngs.words);
  delayRun(6500, allObjs, sttngs);
  });

  //listener for the popup signal
  chrome.runtime.onMessage.addListener(runOnMsg);
})();
