const API_URL = 'https://api.iotaichi.com'
const getAddressInfo = async (address) => {
    const key = 'common.walletsList'
    return new Promise((resolve) => {
        window.chrome.storage.local.get(key, (res) => {
            res = res[key] || []
            let addressInfo = null
            if (address) {
                addressInfo = (res || []).find((e) => e.address === address)
            } else {
                addressInfo = (res || []).find((e) => e.isSelected)
            }
            resolve(addressInfo)
        })
    })
}
const getValidAddresses = async (address) => {
    if (!address) {
        const addressInfo = await getAddressInfo()
        address = addressInfo.address
    }
    if (!address) {
        return []
    }
    const key = `valid.addresses.${address}`
    return new Promise((resolve) => {
        window.chrome.storage.local.get(key, (res) => {
            resolve(res[key] || [])
        })
    })
}
const getBalanceNodeMatch = async (method, addressList) => {
    const addressInfo = await getAddressInfo()
    const nodeId = addressInfo?.nodeId
    const nodeInfo = TanglePayNodeInfo.list.find((e) => e.id == nodeId)
    switch (nodeId) {
        case TanglePayNodeInfo.IOTA_NODE_ID:
        case TanglePayNodeInfo.SMR_NODE_ID:
            {
                if (method !== 'iota_getBalance') {
                    return null
                }
                let isMatch = true
                const reg = new RegExp('^' + nodeInfo.bech32HRP)
                addressList.forEach((e) => {
                    if (!reg.test(e)) {
                        isMatch = false
                    }
                })
                if (!isMatch) {
                    return null
                }
            }
            break
        default:
            {
                if (method !== 'eth_getBalance') {
                    return null
                }
                let isMatch = true
                addressList.forEach((e) => {
                    if (!/^0x/i.test(e)) {
                        isMatch = false
                    }
                })
                if (!isMatch) {
                    return null
                }
            }
            break
    }
    return nodeInfo
}
const getBalanceInfo = async (address, nodeInfo, assetsList) => {
    assetsList = assetsList || []
    let amount = 0
    let otherRes = {}
    let collectibles = []
    switch (nodeInfo.id) {
        case TanglePayNodeInfo.IOTA_NODE_ID:
        case TanglePayNodeInfo.SMR_NODE_ID: {
            let isGetIota = false
            let isGetSmr = false
            let isGetSoonaverse = false
            let isGetStakingSmr = false
            let isGetStakingAsmb = false
            if (nodeInfo.id == TanglePayNodeInfo.IOTA_NODE_ID) {
                isGetIota = assetsList.includes('iota')
                isGetSoonaverse = assetsList.includes('soonaverse')
                isGetStakingSmr = assetsList.includes('smr')
                isGetStakingAsmb = assetsList.includes('asmb')
            }
            if (nodeInfo.id == TanglePayNodeInfo.SMR_NODE_ID) {
                isGetSmr = assetsList.includes('smr')
            }
            if (isGetIota || isGetSmr) {
                const res = await fetch(`${nodeInfo.explorerApiUrl}/search/${nodeInfo.network}/${address}`).then(
                    (res) => res.json()
                )
                amount = res?.addressDetails?.balance || res?.address?.balance || 0
            }
            if (isGetStakingSmr || isGetStakingAsmb) {
                const res = await fetch(`${nodeInfo.url}/api/plugins/participation/addresses/${address}`).then((res) =>
                    res.json()
                )
                otherRes = res?.data?.rewards || {}
            }
            if (isGetSoonaverse) {
                collectibles = await window.soon.getNftsByIotaAddress([address])
            }
            break
        }
        default:
            {
                const isGetEvm = assetsList.includes('evm')
                const isGetSoonaverse = assetsList.includes('soonaverse')
                const url = nodeInfo.url
                if (isGetEvm) {
                    const web3 = new Web3(url)
                    amount = await web3.eth.getBalance(address)
                }
                if (isGetSoonaverse) {
                    collectibles = await window.soon.getNftsByEthAddress(address)
                }
            }
            break
    }
    return {
        amount,
        otherRes,
        collectibles
    }
}
var setBackgroundData = (key, data) => {
    window[key] = data
}
var getBackgroundData = (key) => {
    return window[key] || null
}
var TanglePayNodeInfo = { list: [] }
window.tanglepayDialog = null
window.tanglepayDialogKeep = false
window.tanglepayCallBack = {}

// remove a dialog
chrome.windows.onRemoved.addListener((id) => {
    if (window.tanglepayDialog === id) {
        window.tanglepayDialog = null
        window.tanglepayDialogKeep = false
    }
})

// create a dialog
var createDialog = function (params, isKeepPopup) {
    function create() {
        chrome.windows.create(params, (w) => {
            window.tanglepayDialog = w.id
            window.tanglepayDialogKeep = isKeepPopup
        })
    }
    if (window.tanglepayDialog) {
        try {
            window.tanglepayDialogKeep = false
            chrome.windows.remove(window.tanglepayDialog)
        } catch (error) {
            // console.log(error)
        }
    }
    create()
}

// get message from content-script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var isMac = /macintosh|mac os x/i.test(navigator.userAgent)
    var params = {
        focused: true,
        height: isMac ? 630 : 636,
        left: request.left,
        top: 80,
        type: 'popup',
        width: isMac ? 375 : 390
    }
    // sendResponse('It\'s TanglePay, message recieved: ' + JSON.stringify(request))
    const cmd = (request?.cmd || '').replace('contentToBackground##', '')
    const origin = request?.origin
    const isKeepPopup = request?.isKeepPopup ? 1 : 0
    window.tanglepayCallBack[cmd] = sendResponse
    switch (cmd) {
        case 'tanglePayDeepLink': {
            params.url = chrome.extension.getURL('index.html') + `?url=${encodeURIComponent(request.greeting)}`
            createDialog(params)
            return true
        }
        case 'getTanglePayInfo':
            {
                sendResponse({
                    cmd: cmd,
                    data: {
                        version: chrome?.app?.getDetails()?.version
                    }
                })
            }
            break
        case 'iota_request': {
            const { method, params: requestParams } = request.greeting
            let { content, expires } = requestParams || {}
            content = content || ''
            expires = expires || 1000 * 3600 * 24
            // get cache data
            const cacheAddress = getBackgroundData('cur_wallet_address')
            const cacheKey = `${origin}_${method}_${cacheAddress}`
            let cacheRes = getBackgroundData(cacheKey)
            const connectCacheKey = `${origin}_iota_connect_${cacheAddress}`
            const connectCacheRes = getBackgroundData(connectCacheKey)
            let isConnect = false
            if (connectCacheRes && connectCacheRes?.expires && connectCacheRes?.expires > new Date().getTime()) {
                isConnect = true
                if (cacheRes) {
                    delete cacheRes.expires
                    sendToContentScript({
                        cmd: 'iota_request',
                        code: 200,
                        data: {
                            method,
                            response: cacheRes
                        }
                    })
                    if (method === 'iota_connect') {
                        setBackgroundData(connectCacheKey, {
                            ...connectCacheRes,
                            expires: expires + new Date().getTime()
                        })
                    }
                    if (!isKeepPopup && window.tanglepayDialog) {
                        window.tanglepayDialogKeep = false
                        chrome.windows.remove(window.tanglepayDialog)
                    }
                    return true
                }
            }
            if (!isConnect && method !== 'iota_connect') {
                sendToContentScript({
                    cmd: 'iota_request',
                    code: -1,
                    data: {
                        method,
                        response: {
                            msg: 'not authorized',
                            status: 2
                        }
                    }
                })
                return true
            }
            switch (method) {
                case 'iota_getPublicKey':
                    {
                        getAddressInfo(requestParams?.address).then((addressInfo) => {
                            sendToContentScript({
                                cmd: 'iota_request',
                                code: addressInfo ? 200 : -1,
                                data: {
                                    method,
                                    response: addressInfo ? addressInfo?.publicKey : ''
                                }
                            })
                        })
                    }
                    break
                case 'iota_accounts':
                    const sendAccountsRes = (list) => {
                        sendToContentScript({
                            cmd: 'iota_request',
                            code: list.length > 0 ? 200 : -1,
                            data: {
                                method,
                                response: list
                            }
                        })
                    }
                    getAddressInfo(requestParams?.address).then((addressInfo) => {
                        if (!addressInfo) {
                            sendAccountsRes([])
                        } else {
                            getValidAddresses(addressInfo.addres).then((list) => {
                                sendAccountsRes(list)
                            })
                        }
                    })
                    break
                case 'iota_sendTransaction':
                    {
                        const {
                            to,
                            value,
                            unit = '',
                            network = '',
                            merchant = '',
                            item_desc = '',
                            data = ''
                        } = requestParams
                        const url = `tanglepay://iota_sendTransaction/${to}?isKeepPopup=${isKeepPopup}&origin=${origin}&expires=${expires}&value=${value}&unit=${unit}&network=${network}&merchant=${merchant}&item_desc=${item_desc}&taggedData=${data}`
                        params.url = chrome.extension.getURL('index.html') + `?url=${encodeURIComponent(url)}`
                    }
                    break
                case 'iota_changeAccount':
                    {
                        const { network = '' } = requestParams
                        const url = `tanglepay://${method}?isKeepPopup=${isKeepPopup}&origin=${origin}&network=${network}&expires=${expires}`
                        params.url = chrome.extension.getURL('index.html') + `?url=${encodeURIComponent(url)}`
                    }
                    break
                case 'iota_sign':
                case 'iota_connect':
                    {
                        const url = `tanglepay://${method}?isKeepPopup=${isKeepPopup}&origin=${origin}&content=${content}&expires=${expires}`
                        params.url = chrome.extension.getURL('index.html') + `?url=${encodeURIComponent(url)}`
                    }
                    break
                case 'iota_getBalance':
                case 'eth_getBalance':
                    const { addressList, assetsList } = requestParams
                    const sendBalanceRes = ({ amount, others, collectibles }) => {
                        if (amount < 0) {
                            sendToContentScript({
                                cmd: 'iota_request',
                                code: -1,
                                data: {
                                    method,
                                    response: {
                                        msg: 'address is error',
                                        status: 100
                                    }
                                }
                            })
                        } else {
                            const assetsData = {
                                amount,
                                collectibles: [],
                                others: others || [],
                                collectibles: collectibles || []
                            }
                            sendToContentScript({
                                cmd: 'iota_request',
                                code: 200,
                                data: {
                                    method,
                                    response: assetsData
                                }
                            })
                        }
                    }
                    const getAddressListBalance = (addressList) => {
                        getBalanceNodeMatch(method, addressList).then((nodeInfo) => {
                            if (!nodeInfo || addressList.length === 0) {
                                sendBalanceRes({
                                    amount: -1
                                })
                            } else {
                                Promise.all(addressList.map((e) => getBalanceInfo(e, nodeInfo, assetsList))).then(
                                    (res) => {
                                        let balance = new BigNumber(0)
                                        let others = {}
                                        let collectibles = []
                                        res.forEach((e) => {
                                            const { amount, otherRes } = e
                                            balance = balance.plus(amount || 0)
                                            collectibles = [...collectibles, ...e.collectibles]
                                            for (const i in otherRes) {
                                                const { amount, minimumReached, symbol } = otherRes[i]
                                                others[symbol] = others[symbol] || {
                                                    amount: new BigNumber(0),
                                                    symbol,
                                                    icon: `https://api.iotaichi.com/icon/${symbol.replace(
                                                        /^micro/,
                                                        ''
                                                    )}.png`
                                                }
                                                if (minimumReached) {
                                                    others[symbol].amount = others[symbol].amount.plus(amount)
                                                }
                                            }
                                        })
                                        for (const i in others) {
                                            others[i].amount = Number(others[i].amount)
                                        }
                                        sendBalanceRes({
                                            amount: Number(balance),
                                            others: Object.values(others),
                                            collectibles
                                        })
                                    }
                                )
                            }
                        })
                    }
                    if (addressList.length === 0) {
                        getValidAddresses().then((list) => {
                            getAddressListBalance(list)
                        })
                    } else {
                        getAddressListBalance(addressList)
                    }
                    break
                default:
                    params.url =
                        chrome.extension.getURL('index.html') +
                        `?isKeepPopup=${isKeepPopup}&cmd=iota_request&origin=${encodeURIComponent(
                            origin
                        )}&method=${method}&params=${encodeURIComponent(JSON.stringify(request.greeting.params))}`
                    break
            }
            if (!params.url) {
                return true
            }
            if (window.tanglepayDialog && window.tanglepayDialogKeep) {
                const views = chrome.extension.getViews()
                const curView = views.find((e) => e.Bridge)
                if (curView) {
                    curView.Bridge.connect(params.url)
                }
                chrome.windows.update(window.tanglepayDialog, {
                    focused: true
                })
            } else {
                const popupList = chrome.extension.getViews({ type: 'popup' })
                if (popupList?.length > 0 && popupList[0].Bridge) {
                    if (/url=tanglepay:\/\//.test(decodeURIComponent(params.url))) {
                        popupList[0].location.href = params.url
                    } else {
                        popupList[0].Bridge.connect(params.url)
                    }
                } else {
                    createDialog(params, isKeepPopup == 1)
                }
            }
            return true
        }
        default:
            sendResponse({ success: 'ok' })
            break
    }
})

// send message to content-script
function sendToContentScript(message) {
    // connect
    if (message.cmd === 'iota_event') {
        window.eventsTabIdList = window.eventsTabIdList || []
        chrome.tabs.query({}, function (tabs) {
            tabs.forEach((e) => {
                const port = window.eventsTabIdList[e.id] || chrome.tabs.connect(e.id, { name: 'tanglepay_connect' })
                port.postMessage(message)
            })
        })
    } else {
        // message
        const callBack = window.tanglepayCallBack[message.cmd]
        callBack && callBack(message)
        window.tanglepayCallBack[message.cmd] = null
    }
}
