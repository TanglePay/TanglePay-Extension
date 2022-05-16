var setBackgroundData = (key, data) => {
    window[key] = data
}
var getBackgroundData = (key) => {
    return window[key] || null
}
window.tanglepayDialog = null
window.tanglepayDialogKeep = false
window.tanglepayCallBack = {}

// remove a dialog
chrome.windows.onRemoved.addListener((id) => {
    if (window.tanglepayDialog === id) {
        window.tanglepayDialog = null
        window.tanglepayDialogKeep = false
    }
})

// create a dialog
var createDialog = function (params, isKeepPopup) {
    function create() {
        chrome.windows.create(params, (w) => {
            window.tanglepayDialog = w.id
            window.tanglepayDialogKeep = isKeepPopup
        })
    }
    if (window.tanglepayDialog) {
        try {
            window.tanglepayDialogKeep = false
            chrome.windows.remove(window.tanglepayDialog)
        } catch (error) {
            // console.log(error)
        }
    }
    create()
}

// get message from content-script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var params = {
        focused: true,
        height: 630,
        left: request.left,
        top: 80,
        type: 'popup',
        width: 375
    }
    // sendResponse('It\'s TanglePay, message recieved: ' + JSON.stringify(request))
    const cmd = (request?.cmd || '').replace('contentToBackground##', '')
    const origin = request?.origin
    const isKeepPopup = request?.isKeepPopup ? 1 : 0
    window.tanglepayCallBack[cmd] = sendResponse
    switch (cmd) {
        case 'tanglePayDeepLink': {
            params.url = chrome.extension.getURL('index.html') + `?url=${encodeURIComponent(request.greeting)}`
            createDialog(params)
            return true
        }
        case 'getTanglePayInfo':
            {
                sendResponse({
                    cmd: cmd,
                    data: {
                        version: chrome?.app?.getDetails()?.version
                    }
                })
            }
            break
        case 'iota_request': {
            const { method, params: requestParams } = request.greeting
            let { content, expires } = requestParams || {}
            content = content || ''
            expires = expires || 1000 * 3600 * 24
            // get cache data
            const cacheAddress = getBackgroundData('cur_wallet_address')
            const cacheKey = `${origin}_${method}_${cacheAddress}`
            let cacheRes = getBackgroundData(cacheKey)
            const connectCacheKey = `${origin}_iota_connect_${cacheAddress}`
            const connectCacheRes = getBackgroundData(connectCacheKey)
            if (
                cacheRes &&
                connectCacheRes &&
                connectCacheRes?.expires &&
                connectCacheRes?.expires > new Date().getTime()
            ) {
                delete cacheRes.expires
                sendToContentScript({
                    cmd: 'iota_request',
                    code: 200,
                    data: {
                        method,
                        response: cacheRes
                    }
                })
                if (method === 'iota_connect') {
                    setBackgroundData(connectCacheKey, {
                        ...connectCacheRes,
                        expires: expires + new Date().getTime()
                    })
                }
                if (!isKeepPopup && window.tanglepayDialog) {
                    window.tanglepayDialogKeep = false
                    chrome.windows.remove(window.tanglepayDialog)
                }
                return true
            }
            if (method === 'iota_sign' || method === 'iota_connect') {
                const url = `tanglepay://${method}?isKeepPopup=${isKeepPopup}&origin=${origin}&content=${content}&network=mainnet&expires=${expires}`
                params.url = chrome.extension.getURL('index.html') + `?url=${encodeURIComponent(url)}`
            } else {
                params.url =
                    chrome.extension.getURL('index.html') +
                    `?isKeepPopup=${isKeepPopup}&cmd=iota_request&origin=${encodeURIComponent(
                        origin
                    )}&method=${method}&params=${encodeURIComponent(JSON.stringify(request.greeting.params))}`
            }
            if (window.tanglepayDialog && window.tanglepayDialogKeep) {
                const views = chrome.extension.getViews()
                const curView = views.find((e) => e.Bridge)
                if (curView) {
                    curView.Bridge.connect(params.url)
                }
                chrome.windows.update(window.tanglepayDialog, {
                    focused: true
                })
            } else {
                const popupList = chrome.extension.getViews({ type: 'popup' })
                if (popupList?.length > 0 && popupList[0].Bridge) {
                    if (/url=tanglepay:\/\//.test(decodeURIComponent(params.url))) {
                        popupList[0].location.href = params.url
                    } else {
                        popupList[0].Bridge.connect(params.url)
                    }
                } else {
                    createDialog(params, isKeepPopup == 1)
                }
            }
            return true
        }
        default:
            sendResponse({ success: 'ok' })
            break
    }
})

// send message to content-script
function sendToContentScript(message) {
    // connect
    if (message.cmd === 'iota_event') {
        window.eventsTabIdList = window.eventsTabIdList || []
        chrome.tabs.query({}, function (tabs) {
            tabs.forEach((e) => {
                const port = window.eventsTabIdList[e.id] || chrome.tabs.connect(e.id, { name: 'tanglepay_connect' })
                port.postMessage(message)
            })
        })
    } else {
        // message
        const callBack = window.tanglepayCallBack[message.cmd]
        callBack && callBack(message)
        window.tanglepayCallBack[message.cmd] = null
    }
}
