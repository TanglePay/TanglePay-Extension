document.addEventListener('DOMContentLoaded', function () {
    // 注入自定义JS
    injectCustomJs()
})

// 向页面注入JS
function injectCustomJs(jsPath) {
    jsPath = jsPath || 'js/inject.js'
    var temp = document.createElement('script')
    temp.setAttribute('type', 'text/javascript')
    // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
    temp.src = chrome.extension.getURL(jsPath)
    temp.onload = function () {
        this.parentNode.removeChild(this)
    }
    document.body.appendChild(temp)
}

// 接收来自后台的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(
        '收到来自 ' + (sender.tab ? 'content-script(' + sender.tab.url + ')' : 'popup或者background') + ' 的消息：',
        request
    )
})

// 主动发送消息给后台
function sendMessageToBackground(message) {
    var left = window.document.body.offsetWidth - 400
    chrome.runtime.sendMessage({ greeting: message, left: left }, function (response) {
        console.log(response)
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
