chrome.runtime.onInstalled.addListener(function() {
    setData({domain: "", token: '', tokenValidty: 0});
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.message === "setAlarm"){
            chrome.alarms.create('token_expiry',{when: Date.now() + request.timer * 1000});
        }else if(request.message === "setData"){
            setData(request.data).then(result => sendResponse(result));
        }else if(request.message === 'getData'){
            getData(request.key).then(result => sendResponse({data: result}));
        }
        return true;
    }
);

chrome.alarms.onAlarm.addListener(function(alarm){
    if(alarm.name === "token_expiry"){
        chrome.storage.sync.get(['extensionStatus','domain'], function(result) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
            } else {
                if(result.extensionStatus){
                    chrome.tabs.query({'url': result.domain + '/*'}, function(tabs) {
                        if ( tabs.length > 0 ) {
                            chrome.tabs.executeScript( 
                                tabs[0].id, 
                                { file: "extension.js", allFrames: false },
                                function(results){
                                    console.log(results);
                                }
                            );
                        } else {
                            setData({domain: "", token: '', tokenValidty: 0});
                        }
                    });
                }else{
                    setData({domain: "", token: '', tokenValidty: 0});
                }
            }
        })
    }
});

/**
  * Gets the data from chrome storage
 */
function getData(sKey) {
    return new Promise(function(resolve, reject) {
      chrome.storage.sync.get(sKey, function(items) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          reject(chrome.runtime.lastError.message);
        } else {
          resolve(items);
        }
      });
    });
}

/**
  * Stores the data locally
 */
function setData(data) {
    return new Promise(function(resolve, reject) {
      chrome.storage.sync.set(data, function() {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          reject(chrome.runtime.lastError.message);
        } else {
          resolve('SUCCESS');
        }
      });
    });
}

