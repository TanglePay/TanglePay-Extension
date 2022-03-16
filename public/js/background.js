var setBackgroundData = (key, data) => {
    window[key] = data
}
var getBackgroundData = (key) => {
    return window[key] || null
}
window.tanglepayDialog = null

// Receiving message from content-script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // sendResponse('It\'s TanglePay, message recieved: ' + JSON.stringify(request))
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
            // console.log(error)
        }
    }
    create()
})
