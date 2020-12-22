'use strict';

document.addEventListener('DOMContentLoaded', domLoaded);

function domLoaded() {
  let self = this;

  /* GET RECORDS AND STATUS **************/
  chrome.runtime.sendMessage({ event: "load" });

  /* UI LOCALIZATION *********************/
  document.querySelectorAll('[data-locale]').forEach(elem => {
    elem.innerText = chrome.i18n.getMessage(elem.dataset.locale);
  });

  /* EVENT HANDLERS **********************/
  document.getElementById("btnToggle").addEventListener('click', emitToggleStatus);
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
  // window.close();
}

function renderStatus(status) {
    document.getElementById("btnToggle").innerText = (status===true) ?
      chrome.i18n.getMessage("uiEnabledTitle") : chrome.i18n.getMessage("uiDisabledTitle") ;
}

//Build the DOM from some data
//ToDo: spostare qui getHostname ed eseguire solo quando il popup è visibile
function renderRecords(data) {
  //ToDo: controllare che la pagina sia già caricata
  let historyDom = "";

  if(data && data.length) {
    for(let i=0; i<data.length; i++) {
      // historyDom += "<div>"; /* ToDev 134 */
      historyDom += "<a class='historyRecord' data-href='" + data[i].url + "' target='_blank'>" + data[i].title + "</a>";
      // historyDom += "<br/>"; /* ToDev 134 */
      // historyDom += "</div>"; /* ToDev 134 */
    }
  } else {
    historyDom = "<div>" + chrome.i18n.getMessage("appNoRecords") + "</div>";
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