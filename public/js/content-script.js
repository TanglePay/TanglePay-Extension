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

// Get background message
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
})

function sendMessageToBackground(message) {
    var left = window.document.body.offsetWidth - 400
    chrome.runtime.sendMessage({ greeting: message, left: left }, function (response) {
    })
}

window.addEventListener(
    'message',
    function (e) {
        switch (e.data.cmd) {
            case 'openTanglePay':
                sendMessageToBackground(e.data.data)
                break
        }
    },
    false
)
