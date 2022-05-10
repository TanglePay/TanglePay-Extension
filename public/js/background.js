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
            const { method } = request.greeting
            if (method === 'iota_sign') {
                const [content] = request.greeting.params
                const url = `tanglepay://iota_sign?isKeepPopup=${isKeepPopup}&origin=${origin}&content=${content}&network=mainnet`
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
            } else {
                createDialog(params, isKeepPopup == 1)
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
    const callBack = window.tanglepayCallBack[message.cmd]
    callBack && callBack(message)
    window.tanglepayCallBack[message.cmd] = null
}
