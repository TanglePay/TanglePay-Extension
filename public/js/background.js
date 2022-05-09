var setBackgroundData = (key, data) => {
    window[key] = data
}
var getBackgroundData = (key) => {
    return window[key] || null
}
window.tanglepayDialog = null
window.tanglepayCallBack = {}

// create a dialog
var createDialog = function (params) {
    function create() {
        chrome.windows.create(params, (w) => {
            window.tanglepayDialog = w.id
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
    var cmd = (request?.cmd || '').replace('contentToBackground##', '')
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
        case 'iota_request':
            {
                const { method } = request.greeting
                ///// deeplink->sign
                if (method === 'iota_accounts') {
                    const [address, content] = request.greeting.params
                    const url = `tanglepay://iota_accounts?content=${content}&network=mainnet&fromAddress=${address}`
                    params.url = chrome.extension.getURL('index.html') + `?url=${encodeURIComponent(url)}`
                } else {
                    params.url =
                        chrome.extension.getURL('index.html') +
                        `?cmd=iota_request&method=${method}&params=${encodeURIComponent(
                            JSON.stringify(request.greeting.params)
                        )}`
                }
                createDialog(params)
                return true
            }
            break
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
