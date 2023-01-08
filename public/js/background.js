window = {}
importScripts('./sdk/bignumber.js')
// importScripts('./sdk/soonaverse.js')
importScripts('./sdk/web3.min.js')
importScripts('./sdk/Converter.js')
importScripts('./sdk/TokenERC20.js')
const API_URL = 'https://api.iotaichi.com'

const getLocalStorage = async (key) => {
    return new Promise((resolve) => {
        chrome.storage.local.get(key, (res) => {
            res = res[key] || null
            resolve(res)
        })
    })
}

const getFoundry = async (nodeUrl, id) => {
    const localTokensConfig = (await getLocalStorage('shimmer.sdk.tokensConfig')) || {}
    if (localTokensConfig[id]) {
        return localTokensConfig[id]
    }
    let foundryOutput = await fetch(`${nodeUrl}/api/indexer/v1/outputs/foundry/${id}`).then((res) => res.json())
    foundryOutput = foundryOutput?.items?.[0] || ''
    if (!foundryOutput) {
        return {}
    }
    const output = await fetch(`${nodeUrl}/api/core/v2/outputs/${foundryOutput}`).then((res) => res.json())
    localTokensConfig[id] = output
    chrome.storage.local.set({
        ['shimmer.sdk.tokensConfig']: localTokensConfig
    })
    return output
}

const getLoginToken = async () => {
    const key = 'token'
    return new Promise((resolve) => {
        chrome.storage.local.get(key, (res) => {
            resolve(res[key] || '')
        })
    })
}

const getAddressInfo = async (address) => {
    const key = 'common.walletsList'
    return new Promise((resolve) => {
        chrome.storage.local.get(key, (res) => {
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
        chrome.storage.local.get(key, (res) => {
            resolve(res[key] || [])
        })
    })
}
function checkUnLock(output) {
    const nowTime = parseInt(new Date().getTime() / 1000)
    let unlockConditions = output?.output?.unlockConditions || []
    let lockData = unlockConditions.find((e) => e.type != 0)
    if (lockData && lockData.type == 2 && nowTime > lockData.unixTime) {
        lockData = null
    }
    const features = output?.output?.features || []
    let featuresLock = false
    if (features.length > 0) {
        const PARTICIPATE = `0x${util_js.Converter.utf8ToHex('PARTICIPATE')}`
        featuresLock = !!features.find((e) => e.tag === PARTICIPATE)
    }
    return !lockData && !featuresLock
}
function checkOutput(output) {
    const isSpent = output?.metadata?.isSpent
    const outputType = output?.output?.type
    const nativeTokens = output?.output?.nativeTokens || []
    const isUnLock = checkUnLock(output)
    const canUse = !isSpent && outputType == 3 && !nativeTokens.length && isUnLock
    return canUse
}
//shimmer get outputs
const getShimmerBalance = async (nodeUrl, address) => {
    const response = await fetch(`${nodeUrl}/api/indexer/v1/outputs/basic?address=${address}`).then((res) => res.json())
    let total = BigNumber(0)
    let nativeTokens = {}
    const localOutputDatas = await Promise.all(
        response.items.map((outputId) => fetch(`${nodeUrl}/api/core/v2/outputs/${outputId}`).then((res) => res.json()))
    )
    for (const [index, outputId] of response.items.entries()) {
        const output = localOutputDatas[index]
        if (!output.metadata.isSpent) {
            const isUnLock = checkUnLock(output)
            const isCheckOutput = checkOutput(output)
            if (isCheckOutput) {
                total = total.plus(output.output.amount)
            }

            const nativeTokenOutput = output.output
            if (Array.isArray(nativeTokenOutput.nativeTokens)) {
                for (const token of nativeTokenOutput.nativeTokens) {
                    if (isUnLock) {
                        nativeTokens[token.id] = nativeTokens[token.id] || BigNumber(0)
                        nativeTokens[token.id] = nativeTokens[token.id].plus(token.amount)
                    }
                }
            }
        }
    }
    return {
        balance: Number(total),
        nativeTokens
    }
}
const getNodeInfo = async () => {
    const addressInfo = await getAddressInfo()
    const nodeId = addressInfo?.nodeId
    TanglePayNodeInfo = (await getBackgroundData('tanglePayNodeList')) || { list: [] }
    const nodeInfo = TanglePayNodeInfo.list.find((e) => e.id == nodeId)
    return nodeInfo || {}
}
const getBalanceNodeMatch = async (method, addressList) => {
    const addressInfo = await getAddressInfo()
    const nodeId = addressInfo?.nodeId
    TanglePayNodeInfo = (await getBackgroundData('tanglePayNodeList')) || { list: [] }
    const nodeInfo = TanglePayNodeInfo.list.find((e) => e.id == nodeId)
    switch (nodeInfo.type) {
        case 1:
        case 3:
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
    let nativeTokens = {}
    TanglePayNodeInfo = (await getBackgroundData('tanglePayNodeList')) || { list: [] }
    switch (nodeInfo.type) {
        case 1:
        case 3: {
            let isGetIota = false
            let isGetSmr = false
            let isGetSoonaverse = false
            let isGetStakingSmr = false
            let isGetStakingAsmb = false
            if (nodeInfo.type == 1) {
                isGetIota = assetsList.includes('iota')
                isGetSoonaverse = assetsList.includes('soonaverse')
                isGetStakingSmr = assetsList.includes('smr')
                isGetStakingAsmb = assetsList.includes('asmb')
            }
            if (nodeInfo.type == 3) {
                isGetSmr = assetsList.includes('smr')
            }
            if (isGetIota || isGetSmr) {
                if (isGetSmr) {
                    // const res = await fetch(
                    //     `${nodeInfo.explorerApiUrl}/balance/chronicle/${nodeInfo.network}/${address}`
                    // ).then((res) => res.json())
                    // amount = res?.totalBalance || 0
                    const res = await getShimmerBalance(nodeInfo.url, address)
                    amount = res?.balance || 0
                    nativeTokens = res?.nativeTokens || []
                } else {
                    const res = await fetch(`${nodeInfo.explorerApiUrl}/search/${nodeInfo.network}/${address}`).then(
                        (res) => res.json()
                    )
                    amount = res?.address?.balance || 0
                }
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
                    const web3 = new window.Web3(url)
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
        collectibles,
        nativeTokens
    }
}
var setBackgroundData = (s_key, data) => {
    chrome.storage.local.set({ [s_key]: data })
}
var getBackgroundData = async (s_key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([s_key], (res) => {
            if (res[s_key]) {
                resolve(res[s_key])
            } else {
                resolve(null)
            }
        })
    })
}
var TanglePayNodeInfo = { list: [] }
window.tanglepayDialog = null
window.tanglepayCallBack = {}

// remove a dialog
chrome.windows.onRemoved.addListener((id) => {
    if (window.tanglepayDialog === id) {
        window.tanglepayDialog = null
    }
})

// create a dialog
var createDialog = function (params) {
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
}

// get message from content-script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
    window.tanglepayCallBack[cmd] = sendResponse
    switch (cmd) {
        case 'tanglePayDeepLink': {
            params.url = chrome.runtime.getURL('index.html') + `?url=${encodeURIComponent(request.greeting)}`
            createDialog(params)
            return true
        }
        case 'getTanglePayInfo':
            {
                sendResponse({
                    cmd: cmd,
                    data: {
                        version: chrome?.runtime?.getManifest()?.version
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
            getBackgroundData('cur_wallet_address').then((cacheAddress) => {
                const cacheKey = `${origin}_${method}_${cacheAddress}`
                const connectCacheKey = `${origin}_iota_connect_${cacheAddress}`
                Promise.all([getBackgroundData(cacheKey), getBackgroundData(connectCacheKey)]).then(
                    ([cacheRes, connectCacheRes]) => {
                        let isConnect = false
                        if (
                            connectCacheRes &&
                            connectCacheRes?.expires &&
                            connectCacheRes?.expires > new Date().getTime()
                        ) {
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
                                if (window.tanglepayDialog) {
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
                            case 'get_login_token':
                                {
                                    getLoginToken().then((res) => {
                                        sendToContentScript({
                                            cmd: 'iota_request',
                                            code: res ? 200 : -1,
                                            data: {
                                                method,
                                                response: res || ''
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
                            case 'eth_sendTransaction':
                                {
                                    const setWindowData = () => {
                                        const {
                                            to,
                                            value,
                                            unit = '',
                                            network = '',
                                            merchant = '',
                                            item_desc = '',
                                            data = '',
                                            assetId = '',
                                            nftId = '',
                                            tag = ''
                                        } = requestParams
                                        const url = `tanglepay://${method}/${to}?origin=${origin}&expires=${expires}&value=${value}&unit=${unit}&network=${network}&merchant=${merchant}&item_desc=${item_desc}&tag=${tag}&taggedData=${data}&assetId=${assetId}&nftId=${nftId}`
                                        params.url =
                                            chrome.runtime.getURL('index.html') + `?url=${encodeURIComponent(url)}`
                                    }

                                    const checkSignData = (data) => {
                                        let isCall = false
                                        ;[
                                            '0xdd62ed3e',
                                            '0x70a08231',
                                            '0x313ce567',
                                            '0xa0712d68',
                                            '0x07546172',
                                            '0x06fdde03',
                                            '0x95d89b41',
                                            '0x18160ddd'
                                        ].forEach((e) => {
                                            if (RegExp(`^${e}`).test(data)) {
                                                isCall = true
                                            }
                                        })
                                        return isCall
                                    }
                                    if (
                                        method === 'eth_sendTransaction' &&
                                        requestParams.data &&
                                        checkSignData(requestParams.data)
                                    ) {
                                        const tokenAbi = [...TanglePay_TokenERC20]
                                        getNodeInfo().then(async (res) => {
                                            if (res.url) {
                                                console.log(res.url)
                                                const web3 = new window.Web3(res.url)
                                                const web3Contract = new web3.eth.Contract(tokenAbi, requestParams.to)
                                                const bytes = web3.utils.hexToBytes(requestParams.data)
                                                let functionSign = bytes.slice(0, 4)
                                                functionSign = web3.utils.bytesToHex(functionSign)
                                                console.log(functionSign, web3)
                                                window.web3 = web3
                                                const abi = web3.eth.abi
                                                let item = tokenAbi.find((e) => e.signature === functionSign)
                                                if (item && item.name) {
                                                    const paramsHex = web3.utils.bytesToHex(bytes.slice(4))
                                                    const abiParams = abi.decodeParameters(item.inputs, paramsHex)
                                                    let abiParamsList = []
                                                    for (const i in abiParams) {
                                                        if (
                                                            Object.hasOwnProperty.call(abiParams, i) &&
                                                            /^\d$/.test(i)
                                                        ) {
                                                            abiParamsList.push(abiParams[i])
                                                        }
                                                    }
                                                    const contractRes = await web3Contract.methods[item.name](
                                                        ...abiParamsList
                                                    ).call()
                                                    console.log(contractRes, '----------------')
                                                    sendToContentScript({
                                                        cmd: 'iota_request',
                                                        code: contractRes ? 200 : -1,
                                                        data: {
                                                            method,
                                                            response: contractRes
                                                        }
                                                    })
                                                }
                                            }
                                        })
                                    } else {
                                        setWindowData()
                                    }
                                }
                                break
                            case 'iota_changeAccount':
                                {
                                    const { network = '' } = requestParams
                                    const url = `tanglepay://${method}?origin=${origin}&network=${network}&expires=${expires}`
                                    params.url = chrome.runtime.getURL('index.html') + `?url=${encodeURIComponent(url)}`
                                }
                                break
                            case 'iota_sign':
                            case 'iota_connect':
                                {
                                    const url = `tanglepay://${method}?origin=${origin}&content=${content}&expires=${expires}`
                                    params.url = chrome.runtime.getURL('index.html') + `?url=${encodeURIComponent(url)}`
                                }
                                break
                            case 'iota_getBalance':
                            case 'eth_getBalance':
                                const { addressList, assetsList } = requestParams
                                const sendBalanceRes = ({ amount, others, collectibles, nativeTokens }) => {
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
                                            collectibles: collectibles || [],
                                            nativeTokens: nativeTokens || []
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
                                            Promise.all(
                                                addressList.map((e) => getBalanceInfo(e, nodeInfo, assetsList))
                                            ).then((res) => {
                                                let balance = new BigNumber(0)
                                                let others = {}
                                                let collectibles = []
                                                let nativeTokens = {}
                                                res.forEach((e) => {
                                                    const { amount, otherRes } = e
                                                    balance = balance.plus(amount || 0)
                                                    collectibles = [...collectibles, ...e.collectibles]
                                                    for (const tokenId in e.nativeTokens) {
                                                        const amount = e.nativeTokens[tokenId]
                                                        if (nativeTokens[tokenId]) {
                                                            nativeTokens[tokenId] = nativeTokens[tokenId].plus(amount)
                                                        } else {
                                                            nativeTokens[tokenId] = amount
                                                        }
                                                    }
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
                                                let nativeTokensList = []
                                                for (const tokenId in nativeTokens) {
                                                    const amount = nativeTokens[tokenId]
                                                    nativeTokensList.push({
                                                        id: tokenId,
                                                        amount: Number(amount)
                                                    })
                                                }
                                                if (nativeTokensList.length > 0) {
                                                    Promise.all(
                                                        nativeTokensList.map((e) => {
                                                            return getFoundry(nodeInfo.url, e.id)
                                                        })
                                                    ).then((tokensRes) => {
                                                        nativeTokensList.forEach((e, i) => {
                                                            let info = tokensRes[i]?.output?.immutableFeatures.find(
                                                                (e) => !!e.data
                                                            )
                                                            if (info) {
                                                                e.info = Converter.hexToUtf8(
                                                                    info.data.replace(/^0x/, '')
                                                                )
                                                                e.info = JSON.parse(e.info)
                                                            }
                                                        })
                                                        sendBalanceRes({
                                                            amount: Number(balance),
                                                            others: Object.values(others),
                                                            collectibles,
                                                            nativeTokens: nativeTokensList
                                                        })
                                                    })
                                                } else {
                                                    sendBalanceRes({
                                                        amount: Number(balance),
                                                        others: Object.values(others),
                                                        collectibles,
                                                        nativeTokens: nativeTokensList
                                                    })
                                                }
                                            })
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
                                    chrome.runtime.getURL('index.html') +
                                    `?cmd=iota_request&origin=${encodeURIComponent(
                                        origin
                                    )}&method=${method}&params=${encodeURIComponent(
                                        JSON.stringify(request.greeting.params)
                                    )}`
                                break
                        }
                        if (!params.url) {
                            return true
                        }
                        if (window.tanglepayDialog) {
                            // chrome.windows.getAll(null,res=>{
                            //     const curView = res.find(e=>e.id === window.tanglepayDialog);
                            //     if(curView){
                            //         curView.Bridge.connect(params.url)
                            //     }
                            chrome.windows.update(window.tanglepayDialog, {
                                focused: true,
                                url: params.url
                            })
                            // })
                        } else {
                            // const popupList = chrome.extension.getViews({ type: 'popup' })
                            // if (popupList?.length > 0 && popupList[0].Bridge) {
                            //     if (/url=tanglepay:\/\//.test(decodeURIComponent(params.url))) {
                            //         popupList[0].location.href = params.url
                            //     } else {
                            //         popupList[0].Bridge.connect(params.url)
                            //     }
                            // } else {
                            createDialog(params)
                            // }
                        }
                        // if (window.tanglepayDialog) {
                        //     chrome.windows.getAll(null,res=>{
                        //         const curView = res.find(e=>e.id === window.tanglepayDialog);
                        //         if(curView){
                        //             curView.Bridge.connect(params.url)
                        //         }
                        //         chrome.windows.update(window.tanglepayDialog, {
                        //             focused: true
                        //         })
                        //     })
                        // } else {
                        //     const popupList = chrome.extension.getViews({ type: 'popup' })
                        //     if (popupList?.length > 0 && popupList[0].Bridge) {
                        //         if (/url=tanglepay:\/\//.test(decodeURIComponent(params.url))) {
                        //             popupList[0].location.href = params.url
                        //         } else {
                        //             popupList[0].Bridge.connect(params.url)
                        //         }
                        //     } else {
                        //         createDialog(params)
                        //     }
                        // }
                    }
                )
            })
            return true
        }
        case 'popupBridgeToBackground':
            window.tanglepayCallBack[cmd] = null
            sendToContentScript(request?.sendData || {})
            break
        case 'popupBridgeCloseWindow':
            window.tanglepayCallBack[cmd] = null
            if (window.tanglepayDialog) {
                chrome.windows.remove(window.tanglepayDialog)
            }
            break
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
