// get message from content-script
window.addEventListener(
    'message',
    function (e) {
        const cmd = (e?.data?.cmd || '').replace('contentToInject##', '')
        const data = e?.data?.data
        const code = e?.data?.code
        switch (cmd) {
            case 'getTanglePayInfo':
                window['TanglePay-Extension'].tanglePayVersion = data?.version
                window.dispatchEvent(new CustomEvent('TanglePay-Extension-Ready'))
                break
            case 'iota_request':
                const callBack = window[`iota_request_${data.method}`]
                callBack && callBack(data.response, code)
                break
        }
    },
    false
)

// send message to content-script
function sendToContentScript(params) {
    params.cmd = `injectToContent##${params.cmd}`
    window.postMessage(params, '*')
}

// deeplink
document.body.addEventListener('click', (e) => {
    var a = e.target && e.target.closest ? e.target.closest('a') : null
    if (a && a.href && /tanglepay\:\/\//.test(a.href)) {
        sendToContentScript({ cmd: 'openTanglePay', data: a.href })
    }
})

window.addEventListener('load', function () {
    window['TanglePay-Extension'] = {
        async request({ method, params }) {
            return new Promise((resolve, reject) => {
                window[`iota_request_${method}`] = function (res, code) {
                    if (code === 200) {
                        resolve(res)
                    } else {
                        reject(res)
                    }
                }
                sendToContentScript({
                    cmd: 'iota_request',
                    data: { method, params }
                })
            })
        }
    }
    // get info
    sendToContentScript({
        cmd: 'getTanglePayInfo'
    })
})
