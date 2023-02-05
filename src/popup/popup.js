'use strict';

class Popup {

  res = { //ToDo: use resource service (and prepend "../")
    browserIcon: {
        on: "./icons/on.png",
        off: "./icons/off.png",
    }
  };
  document = null;

  $t = (what, override) => new Resources().translator(what, override);

  constructor(document) {
    let self = this;
    self.document = document;

    /* GET RECORDS AND STATUS **************/
    chrome.storage.sync.get("$isEnabled", function(result) {
      self.renderStatus(result.$isEnabled);
    });
    chrome.storage.local.get("$history", function(result) {
      self.renderRecords(result.$history);
    });

    /* UI LOCALIZATION *********************/
    self.document.querySelectorAll('[data-locale]').forEach(elem => {
      elem.innerText = chrome.i18n.getMessage(elem.dataset.locale);
    });

    /* EVENT HANDLERS **********************/
    self.document.getElementById("toggleWrapper").addEventListener('click', function(){
      chrome.storage.sync.get("$isEnabled", function(result) {
        chrome.storage.sync.set({ '$isEnabled': !result.$isEnabled });
      });
    });

    self.document.getElementById("btnLogClean").addEventListener('click', function(){
      chrome.storage.local.set({ '$history': [] });
    });
    self.document.getElementById("btnCounterClean").addEventListener('click', function(){
      chrome.storage.sync.set({ '$killedCounter': 0 });
    });  
    
    /* WATCH FOR STORAGE CHANGES ***********/
    chrome.storage.onChanged.addListener(function(changes, namespace) {
      for (var key in changes) {
        if (key=="$isEnabled" && namespace=="sync") {
          self.renderStatus(changes[key].newValue);
          //ToDo: remove debug comment (?)
          // setTimeout(function(){
          //   window.close();
          // }, 0); //0 o 350?
        } else if(key=="$history" && namespace=="local") {
          self.renderRecords(changes[key].newValue);
        }
      }
    });

  }

  renderStatus(isEnabled) {
    let self = this;
    self.document.getElementById("btnToggle").innerText = (isEnabled===true) ?
      chrome.i18n.getMessage("uiEnabledTitle") : chrome.i18n.getMessage("uiDisabledTitle");

    self.document.getElementById("btnToggleIcon").src = (isEnabled===true) ?
      self.res.browserIcon.on : self.res.browserIcon.off;
  }
  
  //Build the DOM from some data
  //ToDo: spostare qui getHostname ed eseguire solo quando il popup è visibile
  renderRecords(data) {
    //ToDo: controllare che la pagina sia già caricata
    let historyDom = "";
    let self = this;

    if(data && data.length) {
      for(let i=data.length-1; i>=0; i--) {
        // historyDom += "<div>"; /* ToDo 9: spostare record in div per includere favicon e orario */

        
        historyDom += "<a class='historyRecord' ";
        if(data[i].to && data[i].to.url) {
          historyDom += "data-href='" + data[i].to.url + "' ";
        }
        historyDom += "target='_blank'>";

        var from = "Sconosciuto"; //ToDo: localizzare
        if(data[i].from) {
          if(data[i].from.hostname) {
            from = "<span";
            if(data[i].from.title) {
              from += ' title="' + data[i].from.title + '"';
            }
            from += ">" + data[i].from.hostname + "</span>";
          } else if(data[i].from.title) {
            //ToDo: distinguere titoli provvisori
            //Se vista diretta, troncare
            from = data[i].from.title;
          }
        }
        
        var to = "Sconosciuto"; //ToDo: localizzare
        if(data[i].to) {
          if(data[i].to.hostname) {
            to = "<span";
            if(data[i].to.title) {
              to += ' title="' + data[i].to.title + '"';
            }
            to += ">" + data[i].to.hostname + "</span>";
          } else if(data[i].to.title) {
            //ToDo: distinguere titoli provvisori
            //ToDo: se vista diretta, troncare
            to = data[i].to.title;
          }
        }

        historyDom += from + ((from && to) ? " -> " : "") + to;
        historyDom += "</a>";

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

  allowRecord(e) {
    let self = this;
    if(e && e.target && e.target.dataset.href) {
      chrome.storage.local.set({"$allowing": e.target.dataset.href});
    }
  }

}

document.addEventListener('DOMContentLoaded', function() {
  let srv = new Popup(document);
});