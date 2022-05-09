document.addEventListener('DOMContentLoaded', function () {
    injectCustomJs()
})

// Inject JS to the page
function injectCustomJs(jsPath) {
    jsPath = jsPath || 'js/inject.js'
    var temp = document.createElement('script')
    temp.setAttribute('type', 'text/javascript')
    // extension url is similar as：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
    temp.src = chrome.extension.getURL(jsPath)
    temp.onload = function () {
        this.parentNode.removeChild(this)
    }
    document.body.appendChild(temp)
}

// get message from background
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const cmd = (request?.cmd || '').replace(/.+##/, '')
    sendToInject({
        cmd,
        request
    })
    sendResponse({ success: 'ok' })
})

// send message to background
function sendToBackground(cmd, message) {
    var left = window.document.body.offsetWidth - 400
    chrome.runtime.sendMessage(
        { cmd: `contentToBackground##${cmd}`, greeting: message, left: left },
        function (response) {
            switch (response?.cmd) {
                case 'getTanglePayInfo':
                case 'iota_request':
                    {
                        sendToInject({ ...response })
                    }
                    break
                default:
                    break
            }
        }
    )
}

// get message from inject
window.addEventListener(
    'message',
    function (e) {
        const cmd = (e?.data?.cmd || '').replace('injectToContent##', '')
        switch (cmd) {
            case 'openTanglePay':
            case 'getTanglePayInfo':
            case 'iota_request':
                sendToBackground(cmd, e.data.data)
                break
        }
    },
    false
)

// send message to inject
var sendToInject = function (params) {
    params.cmd = `contentToInject##${params.cmd}`
    window.postMessage(params, '*')
}
