document.addEventListener('DOMContentLoaded', function () {
    injectCustomJs()
})

// Inject JS to the page
function injectCustomJs(jsPath) {
    jsPath = jsPath || 'js/inject.js'
    var temp = document.createElement('script')
    temp.setAttribute('type', 'text/javascript')
    // extension url is similar as：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
    temp.src = chrome.runtime.getURL(jsPath)
    temp.onload = function () {
        this.parentNode.removeChild(this)
    }
    document.body.appendChild(temp)
}

// send message to background
function sendToBackground({ cmd, data, id }) {
    var left = window.document.body.offsetWidth - 400
    var origin = window.location.origin
    chrome.runtime.sendMessage(
        { id, cmd: `contentToBackground##${cmd}`, greeting: data, left: left, origin },
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
            case 'tanglePayDeepLink':
            case 'getTanglePayInfo':
            case 'bgDataGet':
            case 'bgDataSet':
            case 'iota_request':
                sendToBackground({ ...e.data, cmd })
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

// get connect from background
chrome.runtime.onConnect.addListener((e) => {
    if (e.name === 'tanglepay_connect') {
        e.onMessage.addListener(sendToInject)
    }
})
