'use strict';

this.isEnabled = null; //ToDo: eliminare e passarlo tra le funzioni
this.res = { //ToDo: use resource service (and prepend "../")
  browserIcon: {
      on: "../icons/on.png",
      off: "../icons/off.png",
  }
};

document.addEventListener('DOMContentLoaded', domLoaded);

function domLoaded() {
  let self = this;

  /* GET RECORDS AND STATUS **************/
  chrome.storage.sync.get("isEnabled", function(result) {
    isEnabled = result.isEnabled;
    renderStatus();
  });
  chrome.storage.local.get("history", function(result) {
    renderRecords(result.history);
  });

  /* UI LOCALIZATION *********************/
  document.querySelectorAll('[data-locale]').forEach(elem => {
    elem.innerText = chrome.i18n.getMessage(elem.dataset.locale);
  });

  /* EVENT HANDLERS **********************/
  document.getElementById("toggleWrapper").addEventListener('click', toggleStatus);
  
  /* WATCH FOR STORAGE CHANGES ***********/
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
      if (key=="isEnabled" && namespace=="sync") {
        isEnabled = changes[key].newValue;
        renderStatus();
      } else if(key=="history" && namespace=="local") {
        renderRecords(changes[key].newValue);
      }
    }
  });

}

function toggleStatus() {
  chrome.storage.sync.set({ 'isEnabled': !isEnabled }, function() {
    setTimeout(function(){
      window.close();
    }, 0); //0 o 350?
  });
}

function renderStatus() {
    document.getElementById("btnToggle").innerText = (isEnabled===true) ?
      chrome.i18n.getMessage("uiEnabledTitle") : chrome.i18n.getMessage("uiDisabledTitle");

    document.getElementById("btnToggleIcon").src = (isEnabled===true) ?
      res.browserIcon.on : res.browserIcon.off;
}

//Build the DOM from some data
//ToDo: spostare qui getHostname ed eseguire solo quando il popup è visibile
function renderRecords(data) {
  //ToDo: controllare che la pagina sia già caricata
  let historyDom = "";

  if(data && data.length) {
    for(let i=data.length-1; i>=0; i--) {
      // historyDom += "<div>"; /* ToDo 9: spostare record in div per includere favicon e orario */
      if(data[i].url) {
        historyDom += "<a class='historyRecord' data-href='" + data[i].url + "' target='_blank'>" + data[i].title + "</a>";        
      } else {
        historyDom += "<a class='historyRecord'>" + data[i].title + "</a>";
      }
      // historyDom += "<br/>"; /* ToDo 9 */
      // historyDom += "</div>"; /* ToDo 9 */
    }
  }

  document.getElementById("history").innerHTML = historyDom;

  if(data && data.length) {
    let records = document.getElementsByClassName("historyRecord");
    Array.from( records ).forEach(function(record) { 
      record.addEventListener('click', self.allowRecord);
    });
  }
}

function allowRecord(e) {
  let self = this;
  if(e && e.target && e.target.dataset.href) {
    chrome.storage.local.set({"allowing": e.target.dataset.href}, function() {});
  }
}