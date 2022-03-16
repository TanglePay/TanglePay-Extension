var setBackgroundData = (key, data) => {
    window[key] = data
}
var getBackgroundData = (key) => {
    return window[key] || null
}
window.tanglepayDialog = null
//收到来自content-script的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    sendResponse('我是TanglePay，我已收到你的消息：' + JSON.stringify(request))
    var params = {
        focused: true,
        height: 630,
        left: request.left,
        top: 80,
        type: 'popup',
        width: 375,
        url: chrome.extension.getURL('index.html') + `?url=${encodeURIComponent(request.greeting)}`
    }
    function create() {
        chrome.windows.create(params, (w) => {
            window.tanglepayDialog = w.id
        })
    }
    if (window.tanglepayDialog) {
        try {
            chrome.windows.remove(window.tanglepayDialog)
        } catch (error) {
            console.log(error)
        }
    }
    create()
})
