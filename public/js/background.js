var setBackgroundData = (key, data) => {
    window[key] = data
}
var getBackgroundData = (key) => {
    return window[key] || null
}
