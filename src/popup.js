'use strict';

document.addEventListener('DOMContentLoaded', domLoaded);

this.res = { //ToDo: use resource service (and prepend "../")
  browserIcon: {
      on: "../icons/on.png",
      off: "../icons/off.png",
  }
};

function domLoaded() {
  let self = this;

  /* GET RECORDS AND STATUS **************/
  chrome.runtime.sendMessage({ event: "load" });

  /* UI LOCALIZATION *********************/
  document.querySelectorAll('[data-locale]').forEach(elem => {
    elem.innerText = chrome.i18n.getMessage(elem.dataset.locale);
  });

  /* EVENT HANDLERS **********************/
  document.getElementById("toggleWrapper").addEventListener('click', emitToggleStatus);
  chrome.runtime.onMessage.addListener(eventBus);

}

function eventBus(request, sender, sendResponse) { 
  if (request.event === "refresh") { //Refresh UI (get-records)
    renderRecords(request.data);
  } else if (request.event === "status") { //Refresh UI (get-status)
    renderStatus(request.data);
  }
}

function emitToggleStatus() {
  
  chrome.runtime.sendMessage({
    event: "toggle"
  });

  setTimeout(function(){
    window.close();
  }, 350);
}

function renderStatus(status) {
    document.getElementById("btnToggle").innerText = (status===true) ?
      chrome.i18n.getMessage("uiEnabledTitle") : chrome.i18n.getMessage("uiDisabledTitle");

    document.getElementById("btnToggleIcon").src = (status===true) ?
      res.browserIcon.on : res.browserIcon.off;
}

//Build the DOM from some data
//ToDo: spostare qui getHostname ed eseguire solo quando il popup è visibile
function renderRecords(data) {
  //ToDo: controllare che la pagina sia già caricata
  let historyDom = "";

  if(data && data.length) {
    for(let i=0; i<data.length; i++) {
      // historyDom += "<div>"; /* ToDo 9 */
      historyDom += "<a class='historyRecord' data-href='" + data[i].url + "' target='_blank'>" + data[i].title + "</a>";
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
    chrome.runtime.sendMessage({ event: "open", url: e.target.dataset.href });
  }
}