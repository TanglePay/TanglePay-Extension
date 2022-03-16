// 通过postMessage调用content-script
// function invokeContentScript(code) {
//     window.postMessage({ cmd: 'invoke', code: code }, '*')
// }
// // 发送普通消息到content-script
function openTanglePay(url) {
    window.postMessage({ cmd: 'openTanglePay', data: url }, '*')
}
document.body.addEventListener('click', (e) => {
    var a = e.target && e.target.closest ? e.target.closest('a') : null
    if (a && a.href && /tanglepay\:\/\//.test(a.href)) {
        openTanglePay(a.href)
    }
})
