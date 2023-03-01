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


/*---------------------------------------------
pre:none
post text replaced
logic just for youtube comments replace. Because
the youtube comment's code, not just the comments
itself, is a mess. Just running el.innerHTML=el.innerHTML
will mess it up. I don't know the exact reason
why, but I don't need to at the moment. it's 
innerHTML has binary in it, it probably has elements
that can't survive reinstantiation. As such, this
logic just gets the comments and replaces them
---------------------------------------------*/ 
function ytCmmntsReplace(){
//for some reason, the first of the item-section renderer is always the comment container despite the second one looking almost exactly the same
const cmmntSect=document.getElementsByTagName("ytd-item-section-renderer");
  if(cmmntSect.length<=0){
  console.log("youtube comments not found");
  return [];
  }

//youtube seems to wrap all strings in this yt-formatted-string
const ytStrs=cmmntSect[0].getElementsByTagName("yt-formatted-string");
//but, despite being the comments section, not all yt-formatted-string is a comment.
const cmmnts=[];
  for(const ytStr of ytStrs){
    if(ytStr.hasAttribute("id") && ytStr.id=="content-text"){
    cmmnts.push(ytStr);
    }
  }
return cmmnts;
}


//quick function to find youtube video title
/*
<yt-formatted-string force-default-style="" class="style-scope ytd-watch-metadata">Replacing The Term 'Test' | Karl's Corner Podcast</yt-formatted-string>
*/
function ytTtlReplace(){
const els=document.getElementsByTagName("yt-formatted-string");
const ttl=[];
  for (const el of els) {
    if (el.classList.contains("ytd-watch-metadata") && el.hasAttribute('force-default-style') && el.innerHTML===el.innerText){
    ttl.push(el);
    }
  }
return ttl;
}

/*----------------------------------------------
pre: global tagList variable
post: elements replaced
goes through all the elements and runs the replace
----------------------------------------------*/
function contentReplace(allEls, words, noTagList=false){
  for(const el of allEls){
  let txt=el.innerHTML;
    if( (noTagList||tagList.hasOwnProperty(el.tagName.toLocaleLowerCase())) && txt ){
    //do replace.
      Object.keys(words).forEach((word) => {
      //regex search
      const re=new RegExp(word, "gi");
        if(txt.search(re)>=0){
          const newTxt=txt.replace(re, (wrd) => {
          return capWordToStyl(words[word],whichCap(wrd));
          });
        el.innerHTML=newTxt;
        }
      });
    }
  }
}

/*--------------------------------------------
pre: contentReplace()
post: replaces words
a function to decide what type of replacement needs to be done
thanks to youtube comments -_-
---------------------------------------------*/
function runReplace(allEls, sttngs, dmn){
  let exceptionRules=sttngs.whitelist.hasOwnProperty(dmn)?sttngs.whitelist[dmn]:null;
  switch(exceptionRules){
    case "ytCmmntsReplace":
    const ttlEls=ytTtlReplace();
    contentReplace(ttlEls, sttngs.words, true);
    const els=ytCmmntsReplace();
    contentReplace(els, sttngs.words, true);
    break;
    default:
    contentReplace(allEls, sttngs.words);
    break;
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
      chrome.storage.local.get(null, (d) => {
      console.log('FactFiendWordOverhaul: running manual replace');
      runReplace(document.all, d, window.location.host);
      sendResponse({msg: "Got it. Thank you."});
      return true;
      });
    break;
    default:
    break;
  }
return true;
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
console.log("FactFiendWordOverhaul: Delayed Run");
runReplace(allObjs,sttngs, dmn);
}



//main run
console.log(">>>> Chrome Extension: FactFiendWordOverhaul is loaded.");
const dmn=window.location.host;
  chrome.storage.local.get(null, (d) => {
  let sttngs=d;
    if(Object.keys(d).length<=0){
    //initialize
    console.log("FactFiendWordOverhaul: initializing settings");
      const initObj={
      'on':true,
      'blacklist': {},
      'whitelist': {
      'www.youtube.com':'ytCmmntsReplace'
      },
      'words': {
        'woke': 'challenging norms',
        'quiet quitting': 'performing to your pay',
        'cancel culture': 'consequence culture',
        'culture war': 'repression of minorities'
        }
      }
    sttngs=initObj;
    chrome.storage.local.set(initObj);
    }

    //if false, don't run.
    if(!runOnURL(dmn,sttngs.on,sttngs.whitelist,sttngs.blacklist)){
    console.log("FactFiendWordOverhaul: not set to run");
    console.log("FactFiendWordOverhaul: set to run: "+sttngs.on);
    console.log("FactFiendWordOverhaul: domain in whitelist: "+sttngs.whitelist.hasOwnProperty(dmn));
    console.log("FactFiendWordOverhaul: domain in blacklist: "+sttngs.blacklist.hasOwnProperty(dmn));
    return false;
    }

  let allObjs=document.all;

  runReplace(allObjs, sttngs, dmn);
  delayRun(6500, allObjs, sttngs, dmn);
  });

  //listener for the popup signal
  chrome.runtime.onMessage.addListener(runOnMsg);
})();
