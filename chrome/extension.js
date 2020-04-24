'use strict';

runExtension();

function runExtension(){
  handleGetData({message: "getData", key: ['domain', 'tokenValidity', 'extensionStatus']}).then(async result => {
    let data = result;
     // Checks if extension status is on
    if(Object.keys(data).length && data.extensionStatus){
      let currentDomain = window.location.origin;
      // Updates the domain stored to the current domain on the tab
      if(data.domain !== currentDomain){
          data = {domain : currentDomain, token: '', tokenValidity: 0};
          handleSetData({message: "setData", data: data});
      }

      //Checks if the current date is superior to the date the token will expire
      if(Date.now() > data.tokenValidity){
        const tokenResult = await getToken(currentDomain);
        if(tokenResult.accessToken && tokenResult.expiresIn){
          data = {
            domain : currentDomain, 
            token: tokenResult.accessToken, 
            tokenValidity: Date.now() + tokenResult.expiresIn*1000
          };
          handleSetData({message: "setData", data: data});
          saveFile(tokenResult.accessToken);
          // Sets the alarm to warn when the token will expired
          chrome.runtime.sendMessage({message: "setAlarm", timer: tokenResult.expiresIn});
        }
      }
    }
  });
}

function handleGetData(data){
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(data, response => {
        if(response.data) {
            resolve(response.data);
        } else {
            reject('Failed to retrieve data');
        }
    });
  });
}

function handleSetData(data){
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(data, response => {
        if(response === 'SUCCESS') {
            resolve();
        } else {
            reject('Failed to set data');
        }
    });
  });
}

/**
  * Gets the token from Marketing Cloud main page
 */
async function getToken(domain){
    let tokenUrl = domain + "/cloud/update-token.json";
    const result = await fetch(tokenUrl);
    const resultJson = await result.json();
    if(result.status === 200){
        return resultJson;
    }else{
        throw new Error("Failed to retrieve update token.")
    }
}

function saveFile(token){
  let filename = "token.json";
  let blob = new Blob([JSON.stringify({token : token})], {type: 'text/plain'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.href = url;
  a.download = filename;
  a.click();
}

