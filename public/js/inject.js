// Invoke content-script via PostMessage
// function invokeContentScript(code) {
//     window.postMessage({ cmd: 'invoke', code: code }, '*')
// }
// POST message to content-script
function openTanglePay(url) {
    window.postMessage({ cmd: 'openTanglePay', data: url }, '*')
}
document.body.addEventListener('click', (e) => {
    var a = e.target && e.target.closest ? e.target.closest('a') : null
    if (a && a.href && /tanglepay\:\/\//.test(a.href)) {
        openTanglePay(a.href)
    }
})
