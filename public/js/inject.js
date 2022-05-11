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
    params.origin = window.location.origin
    // {cmd,origin,data,isKeepPopup}
    window.postMessage(params, '*')
}

// deeplink
document.body.addEventListener('click', (e) => {
    var a = e.target && e.target.closest ? e.target.closest('a') : null
    if (a && a.href && /tanglepay\:\/\//.test(a.href)) {
        sendToContentScript({ cmd: 'tanglePayDeepLink', data: a.href })
    }
})

window.addEventListener('load', function () {
    window['TanglePay-Extension'] = {
        async request({ method, isKeepPopup, params }) {
            return new Promise((resolve, reject) => {
                const address = window.localStorage.getItem('tanglepay_connect_address') || ''
                if (address) {
                    params = params || {}
                    params.connect_address = address
                }
                window[`iota_request_${method}`] = function (res, code) {
                    if (code === 200) {
                        // cache iota address
                        if (method === 'iota_connect') {
                            window.localStorage.setItem('tanglepay_connect_address', res.address || '')
                        }

                        resolve(res)
                    } else {
                        reject(res)
                    }
                }
                sendToContentScript({
                    cmd: 'iota_request',
                    data: { method, params },
                    isKeepPopup
                })
            })
        }
    }
    // get info
    sendToContentScript({
        cmd: 'getTanglePayInfo'
    })
})
