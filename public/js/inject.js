// deeplink
document.body.addEventListener('click', (e) => {
    var a = e.target && e.target.closest ? e.target.closest('a') : null
    if (a && a.href && /tanglepay\:\/\//.test(a.href)) {
        window.postMessage({ cmd: 'injectToContent##tanglePayDeepLink', data: a.href }, '*')
    }
})

window.TanglePayEnv = 'chrome'
