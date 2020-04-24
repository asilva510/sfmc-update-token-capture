'use strict'

let toggle = document.getElementById("switchCheckbox");

toggle.onclick = function(){
    chrome.storage.sync.set({extensionStatus: toggle.checked});
    let tokenInfo = document.getElementById("tokenInfo");
    tokenInfo.style.display = toggle.checked ? "block" : "none";
}

async function runPopup(){
    chrome.storage.sync.get(['extensionStatus','token', 'tokenValidity', 'domain'], function(result) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
        } else {
            toggle.checked = result.extensionStatus;
            showTokenInfo(result.extensionStatus, result.token, result.tokenValidity);
        }
    })
}

function showTokenInfo(toggleStatus, token, validity){
    let tokenInfo = document.getElementById("tokenInfo");
    let ctoken = document.getElementById("currentToken");
    let tokenDate = document.getElementById("tokenDate");
    if(toggleStatus){
        tokenInfo.style.display = "block";
        ctoken.innerHTML = token;
        let date = new Date(validity);
        tokenDate.innerHTML = Date.now() > date ? 
                                "Expired!" : 
                                date;
    }else{
        tokenInfo.style.display = "none";
    }
}

runPopup();
