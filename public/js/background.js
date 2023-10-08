window = {}
importScripts('./sdk/bignumber.js')
// importScripts('./sdk/soonaverse.js')
importScripts('./sdk/web3.min.js')
importScripts('./sdk/sdkcommon.min.js')
importScripts('./sdk/Converter.js')
importScripts('./sdk/TokenERC20.js')
importScripts('./sdk/NonfungiblePositionManager.js')
const API_URL = 'https://api.iotaichi.com'

const DATA_PER_REQUEST_PREFIX = 'data_per_request_prefix_'
const dataPerRequestHelper = {
    getDataPerRequestKey(reqId) {
        return DATA_PER_REQUEST_PREFIX + reqId
    },
    storeDataPerRequest(reqId, data) {
        if (!data) {
            return
        }
        setBackgroundData(this.getDataPerRequestKey(reqId), data)
    },
    removeDataPerRequest(reqId, hasDataOnRequest = true) {
        if (!hasDataOnRequest) {
            return
        }
        removeBackgroundData(this.getDataPerRequestKey(reqId))
    }
}

// send message to inject
var sendToInject = function (params) {
    params.cmd = `contentToInject##${params.cmd}`
    window.postMessage(params, '*')
}

const flatten = (arr, depth = 1) => (depth != 1 ? arr.reduce((a, v) => a.concat(Array.isArray(v) ? flatten(v, depth - 1) : v), []) : arr.reduce((a, v) => a.concat(v), []))

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

const getUuid = async () => {
    const key = 'key_uuid'
    let uuid = await getLocalStorage(key)
    if (!uuid) {
        uuid = generateUUID()
        setLocalStorage(key, uuid)
    }
    return uuid
}

const getLocalStorage = async (key) => {
    return new Promise((resolve) => {
        chrome.storage.local.get(key, (res) => {
            res = res[key] || null
            resolve(res)
        })
    })
}
const setLocalStorage = (key, value) => {
    chrome.storage.local.set({
        [key]: value
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
        const PARTICIPATE = `0x${Converter.utf8ToHex('PARTICIPATE')}`
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
    const localOutputDatas = await Promise.all(response.items.map((outputId) => fetch(`${nodeUrl}/api/core/v2/outputs/${outputId}`).then((res) => res.json())))
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

const importNFT = async ({ nft, tokenId }, reqId, method) => {
    // Lowercase nft
    nft = nft.toLocaleLowerCase()
    const nodeInfo = await getNodeInfo()
    const callBack = (code, response = null) => {
        sendToContentScript({
            cmd: 'iota_request',
            id: reqId,
            code,
            data: {
                method,
                response
            }
        })
    }
    if (nodeInfo?.type == 2) {
        try {
            await ensureWeb3Client()
            // cur_wallet_address  => `${curWallet.address || ''}_${curWallet.nodeId || ''}`
            const cacheAddress = await getBackgroundData('cur_wallet_address')
            const address = cacheAddress.split('_')[0]

            const importedNFTKey = `${address}.nft.importedList`
            const importedNFTInStorage = (await getBackgroundData(importedNFTKey)) ?? {}

            if (importedNFTInStorage?.[nft] && importedNFTInStorage[nft].find((nft) => nft.tokenId === tokenId)) {
                throw new Error('This NFT has already been imported.')
            }

            const nftContract = new web3_.eth.Contract([...NonfungiblePositionManager], nft)
            const owner = await nftContract.methods.ownerOf(tokenId).call()
            if (owner.toLocaleLowerCase() !== address.toLocaleLowerCase()) {
                throw new Error('This NFT is not owned by the user')
            }

            const tokenURI = await nftContract.methods.tokenURI(tokenId).call()
            const name = await nftContract.methods.name().call()
            const tokenURIRes = await fetch(tokenURI).then((res) => res.json())
            const importedNFTInfo = {
                tokenId,
                name,
                image: tokenURIRes.image,
                description: tokenURIRes.description
            }
            importedNFTInStorage[nft] = [...(importedNFTInStorage[nft] ?? []), importedNFTInfo]
            setBackgroundData(importedNFTKey, importedNFTInStorage)
            callBack(200, { nft, tokenId })
        } catch (error) {
            callBack(-1, error.message)
        }
    } else {
        callBack(-1, 'Node is error')
    }
}

const importContract = async (contract, reqId, method) => {
    await ensureWeb3Client()
    TanglePayNodeInfo = (await getBackgroundData('tanglePayNodeList')) || { list: [] }
    const nodeInfo = await getNodeInfo()
    const sendError = (error) => {
        sendToContentScript({
            cmd: 'iota_request',
            id: reqId,
            code: -1,
            data: {
                method,
                response: error
            }
        })
    }
    if (nodeInfo?.type == 2) {
        const tokenAbi = [...TanglePay_TokenERC20]
        const web3 = web3_
        try {
            const web3Contract = new web3.eth.Contract(tokenAbi, contract)
            const [token, decimal] = await Promise.all([web3Contract.methods.symbol().call(), web3Contract.methods.decimals().call()])
            TanglePayNodeInfo.list.forEach((e) => {
                if (e.id == nodeInfo.id) {
                    const index = (e.contractList || []).findIndex((c) => c.contract.toLocaleLowerCase() == contract)
                    if (index == -1) {
                        e.contractList.push({
                            contract,
                            token,
                            decimal
                        })
                    } else {
                        e.contractList[index] = {
                            ...e.contractList[index],
                            contract,
                            token,
                            decimal
                        }
                    }
                }
            })
            setBackgroundData('tanglePayNodeList', {
                list: TanglePayNodeInfo.list
            })
            sendToContentScript({
                cmd: 'iota_request',
                id: reqId,
                code: 200,
                data: {
                    method,
                    response: {
                        contract,
                        token,
                        decimal
                    }
                }
            })
        } catch (error) {
            sendError(error)
        }
    } else {
        sendError(new Error('node is error'))
    }
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
                isGetSoonaverse = assetsList.includes('soonaverse')
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
                    const res = await fetch(`${nodeInfo.explorerApiUrl}/search/${nodeInfo.network}/${address}`).then((res) => res.json())
                    amount = res?.address?.balance || 0
                }
            }
            if (isGetStakingSmr || isGetStakingAsmb) {
                const res = await fetch(`${nodeInfo.url}/api/plugins/participation/addresses/${address}`).then((res) => res.json())
                otherRes = res?.data?.rewards || {}
            }
            if (isGetSoonaverse) {
                if (nodeInfo.type == 1) {
                    let iotaMemberIds = await fetch(`https://soonaverse.com/api/getMany?collection=member&fieldName=validatedAddress.iota&fieldValue=${address}`).then((res) => res.json())
                    let res = await Promise.all(
                        iotaMemberIds.map((e) => {
                            return fetch(`https://soonaverse.com/api/getMany?collection=nft&fieldName=owner&fieldValue=${e.uid}`)
                                .then((res) => res.json())
                                .catch(() => [])
                        })
                    )
                    res = flatten(res)
                    collectibles = res
                } else if (nodeInfo.type == 3) {
                    let shimmerNftOutputIds = await fetch(`${nodeInfo.url}/api/indexer/v1/outputs/nft?address=${address}`).then((res) => res.json())
                    shimmerNftOutputIds = shimmerNftOutputIds.items

                    const nftInfos = await Promise.all(
                        shimmerNftOutputIds.map((e) => {
                            return fetch(`${nodeInfo.url}/api/core/v2/outputs/${e}`)
                                .then((res) => res.json())
                                .catch(() => {})
                        })
                    )

                    let shimmerRes = []
                    nftInfos.forEach((e, i) => {
                        let info = (e?.output?.immutableFeatures || []).find((d) => {
                            return d.type == 2
                        })
                        if (info && info.data) {
                            try {
                                info = Converter.hexToUtf8(info.data.replace(/^0x/, ''))
                                info = JSON.parse(info)
                                shimmerRes.push({ ...info, nftId: e?.output?.nftId })
                            } catch (error) {}
                        }
                    })
                    collectibles = shimmerRes
                }
            }
            break
        }
        default:
            {
                const isGetEvm = assetsList.includes('evm')
                const isGetSoonaverse = assetsList.includes('soonaverse')
                const url = nodeInfo.url
                if (isGetEvm) {
                    web3_ = undefined
                    await ensureWeb3Client()
                    const web3 = web3_
                    amount = await web3.eth.getBalance(address)
                }
                if (isGetSoonaverse) {
                    let ethMemberIds = await fetch(`https://soonaverse.com/api/getById?collection=member&uid=${address}`).then((res) => res.json())
                    if (ethMemberIds && ethMemberIds.uid) {
                        let list = await fetch(`https://soonaverse.com/api/getMany?collection=nft&fieldName=owner&fieldValue=${ethMemberIds.uid}`)
                            .then((res) => res.json())
                            .catch(() => [])
                        collectibles = list
                    }
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

var removeBackgroundData = (s_key) => {
    console.log('****removeBackgroundData', s_key)
    chrome.storage.local.remove(s_key)
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
chrome.windows.onRemoved.addListener(async (id) => {
    const { windowId, curReqId, hasDataOnRequest } = window.tanglepayDialog ?? {}
    if (windowId === id) {
        dataPerRequestHelper.removeDataPerRequest(curReqId, hasDataOnRequest)
        window.tanglepayDialog = null
        if (curMethod) {
            sendToContentScript({
                cmd: 'iota_request',
                code: -1,
                data: {
                    method: curMethod,
                    response: {
                        msg: 'cancel'
                    }
                },
                id: curReqId
            })
        }
    }
})

// create a dialog
var createDialog = function (params, reqId, dataPerRequest) {
    function create() {
        chrome.windows.getCurrent().then((res) => {
            chrome.windows.create({ ...params, left: res.left + params.left, top: res.top + params.top }, (w) => {
                dataPerRequestHelper.storeDataPerRequest(reqId, dataPerRequest)
                window.tanglepayDialog = {
                    windowId: w.id,
                    tabId: w.tabs[0].id,
                    curReqId: reqId,
                    hasDataOnRequest: !!dataPerRequest
                }
            })
        })
    }
    if (window.tanglepayDialog) {
        try {
            chrome.windows.remove(window.tanglepayDialog.windowId)
        } catch (error) {
            // console.log(error)
        }
    }
    create()
}
let curMethod = ''
let web3_ = undefined
const ensureWeb3Client = () => {
    return new Promise((resolve, reject) => {
        if (web3_ !== undefined) {
            TanglePaySdkCommon.setWeb3Client(web3_)
            resolve()
        } else {
            getNodeInfo()
                .then(async (res) => {
                    if (res.url) {
                        console.log(res.url)
                        web3_ = new window.Web3(res.url)
                        resolve()
                    } else {
                        reject()
                    }
                })
                .catch(reject)
        }
    })
}
// get message from content-script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    var isMac = /macintosh|mac os x/i.test(navigator.userAgent)
    var dataPerRequest = null
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
    if (['bgDataSet', 'bgDataGet', 'bgUuidGet'].includes(cmd)) {
        switch (cmd) {
            case 'bgDataSet':
                {
                    const { key, value } = request.sendData
                    setLocalStorage(key, value)
                }
                break
            case 'bgDataGet':
                {
                    const { key } = request.sendData
                    getLocalStorage(key).then((res) => {
                        sendResponse({
                            cmd: cmd,
                            data: {
                                payload: res ?? ''
                            }
                        })
                    })
                    return true
                }
                break
            case 'bgUuidGet':
                {
                    getUuid().then((res) => {
                        sendResponse({
                            cmd: cmd,
                            data: {
                                payload: res ?? ''
                            }
                        })
                    })
                    return true
                }
                break
        }
    } else {
        const origin = request?.origin
        const reqId = request?.id ? request?.id : 0
        window.tanglepayCallBack[cmd + '_' + reqId] = sendResponse
        const handleRequest = (func, pl, method, id) => {
            console.log(pl)
            func(...pl).then((res) => {
                sendToContentScript(
                    {
                        cmd: 'iota_request',
                        id,
                        code: res ? 200 : -1,
                        data: {
                            method,
                            response: res
                        }
                    },
                    id
                )
            })
        }
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
                curMethod = method
                let { content, expires } = requestParams || {}
                content = content || ''
                expires = expires || 100000000000000000000
                // get cache data
                getBackgroundData('cur_wallet_address').then((cacheAddress) => {
                    const cacheKey = `${origin}_${method}_${cacheAddress}`
                    const connectCacheKey = `${origin}_iota_connect_${cacheAddress}`
                    Promise.all([getBackgroundData(cacheKey), getBackgroundData(connectCacheKey)]).then(([cacheRes, connectCacheRes]) => {
                        let isConnect = false
                        if (connectCacheRes && connectCacheRes?.expires && connectCacheRes?.expires > new Date().getTime()) {
                            isConnect = true
                            if (cacheRes) {
                                delete cacheRes.expires
                                sendToContentScript({
                                    cmd: 'iota_request',
                                    id: reqId,
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
                                    chrome.windows.remove(window.tanglepayDialog.windowId)
                                }
                                return true
                            }
                        }
                        if (!isConnect && method !== 'iota_connect') {
                            sendToContentScript({
                                cmd: 'iota_request',
                                id: reqId,
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
                            case 'iota_merge_nft':
                                {
                                    // const { network = '' } = requestParams
                                    // const url = `tanglepay://${method}?origin=${origin}&network=${network}&expires=${expires}`
                                    // params.url = chrome.runtime.getURL('index.html') + `?url=${encodeURIComponent(url)}`
                                    params.url = chrome.runtime.getURL('index.html') + `#/assets/nftMerge?params=${JSON.stringify(requestParams)}`
                                }
                                break
                            case 'iota_getPublicKey':
                                {
                                    getAddressInfo(requestParams?.address).then((addressInfo) => {
                                        sendToContentScript({
                                            cmd: 'iota_request',
                                            id: reqId,
                                            code: addressInfo ? 200 : -1,
                                            data: {
                                                method,
                                                response: addressInfo ? addressInfo?.publicKey : ''
                                            }
                                        })
                                    })
                                }
                                break
                            case 'iota_getWalletType':
                                {
                                    getAddressInfo(requestParams?.address).then((addressInfo) => {
                                        sendToContentScript({
                                            cmd: 'iota_request',
                                            id: reqId,
                                            code: addressInfo ? 200 : -1,
                                            data: {
                                                method,
                                                response: addressInfo ? addressInfo?.type : ''
                                            }
                                        })
                                    })
                                }
                                break
                            case 'eth_importContract':
                                {
                                    importContract(requestParams.contract, reqId, method)
                                }
                                break
                            case 'eth_importNFT':
                                {
                                    importNFT({ nft: requestParams.nft, tokenId: requestParams.tokenId }, reqId, method)
                                }
                                break
                            case 'get_login_token':
                                {
                                    getLoginToken().then((res) => {
                                        sendToContentScript({
                                            cmd: 'iota_request',
                                            id: reqId,
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
                                        id: reqId,
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
                                        const { to, value, unit = '', network = '', merchant = '', item_desc = '', data = '', assetId = '', nftId = '', tag = '', gas = '' } = requestParams
                                        const url = `tanglepay://${method}/${to}?origin=${origin}&expires=${expires}&value=${value}&unit=${unit}&network=${network}&merchant=${merchant}&item_desc=${item_desc}&tag=${tag}&taggedData=${data}&assetId=${assetId}&nftId=${nftId}&gas=${gas}&reqId=${reqId}`
                                        params.url = chrome.runtime.getURL('index.html') + `?url=${encodeURIComponent(url)}`
                                        const { metadata } = requestParams
                                        dataPerRequest = {
                                            metadata: metadata || null
                                        }
                                    }

                                    const checkSignData = (data) => {
                                        let isCall = false
                                        ;['0xdd62ed3e', '0x70a08231', '0x313ce567', '0xa0712d68', '0x07546172', '0x06fdde03', '0x95d89b41', '0x18160ddd'].forEach((e) => {
                                            if (RegExp(`^${e}`).test(data)) {
                                                isCall = true
                                            }
                                        })
                                        return isCall
                                    }
                                    if (method === 'eth_sendTransaction' && requestParams.data && checkSignData(requestParams.data)) {
                                        const tokenAbi = [...TanglePay_TokenERC20]
                                        ensureWeb3Client().then(async () => {
                                            const web3 = web3_
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
                                                    if (Object.hasOwnProperty.call(abiParams, i) && /^\d$/.test(i)) {
                                                        abiParamsList.push(abiParams[i])
                                                    }
                                                }
                                                const contractRes = await web3Contract.methods[item.name](...abiParamsList).call()
                                                console.log(contractRes, '----------------')
                                                sendToContentScript({
                                                    cmd: 'iota_request',
                                                    id: reqId,
                                                    code: contractRes ? 200 : -1,
                                                    data: {
                                                        method,
                                                        response: contractRes
                                                    }
                                                })
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
                                    const url = `tanglepay://${method}?origin=${origin}&network=${network}&expires=${expires}&reqId=${reqId}`
                                    params.url = chrome.runtime.getURL('index.html') + `?url=${encodeURIComponent(url)}`
                                }
                                break
                            case 'iota_sign':
                            case 'iota_connect':
                                {
                                    const url = `tanglepay://${method}?origin=${origin}&content=${content}&expires=${expires}&reqId=${reqId}`
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
                                            id: reqId,
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
                                            id: reqId,
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
                                            Promise.all(addressList.map((e) => getBalanceInfo(e, nodeInfo, assetsList))).then((res) => {
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
                                                            icon: `https://api.iotaichi.com/icon/${symbol.replace(/^micro/, '')}.png`
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
                                                            let info = tokensRes[i]?.output?.immutableFeatures.find((e) => !!e.data)
                                                            if (info) {
                                                                e.info = Converter.hexToUtf8(info.data.replace(/^0x/, ''))
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
                            case 'eth_getBlockByNumber':
                                {
                                    ensureWeb3Client().then(() => {
                                        handleRequest(TanglePaySdkCommon.ethGetBlockByNumber, requestParams, method, reqId)
                                    })
                                }
                                break
                            case 'eth_gasPrice':
                                {
                                    ensureWeb3Client().then(() => {
                                        handleRequest(TanglePaySdkCommon.ethGasPrice, requestParams, method, reqId)
                                    })
                                }
                                break
                            default:
                                params.url =
                                    chrome.runtime.getURL('index.html') +
                                    `?cmd=iota_request&origin=${encodeURIComponent(origin)}&method=${method}&params=${encodeURIComponent(JSON.stringify(request.greeting.params))}`
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
                            const { windowId, tabId, curReqId: lastReqId, hasDataOnRequest } = window.tanglepayDialog

                            // Step 1: make window focused
                            chrome.windows.update(
                                windowId,
                                {
                                    focused: true
                                },
                                () => {
                                    // Step 2: change tab url
                                    chrome.tabs.update(
                                        tabId,
                                        {
                                            url: params.url
                                        },
                                        () => {
                                            // Step3: clear last reqId and store current reqId
                                            dataPerRequestHelper.removeDataPerRequest(lastReqId, hasDataOnRequest)
                                            dataPerRequestHelper.storeDataPerRequest(reqId, dataPerRequest)
                                            window.tanglepayDialog = {
                                                ...window.tanglepayDialog,
                                                curReqId: reqId,
                                                hasDataOnRequest: !!dataPerRequest
                                            }
                                        }
                                    )
                                }
                            )
                        } else {
                            // const popupList = chrome.extension.getViews({ type: 'popup' })
                            // if (popupList?.length > 0 && popupList[0].Bridge) {
                            //     if (/url=tanglepay:\/\//.test(decodeURIComponent(params.url))) {
                            //         popupList[0].location.href = params.url
                            //     } else {
                            //         popupList[0].Bridge.connect(params.url)
                            //     }
                            // } else {
                            createDialog(params, reqId, dataPerRequest)
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
                    })
                })
                return true
            }
            case 'popupBridgeToBackground':
                // window.tanglepayCallBack[cmd + '_' + reqId] = null
                sendToContentScript(request?.sendData || {})
                break
            case 'popupBridgeCloseWindow':
                window.tanglepayCallBack[cmd + '_' + reqId] = null
                if (window.tanglepayDialog) {
                    chrome.windows.remove(window.tanglepayDialog.windowId)
                }
                break
            default:
                sendResponse({ success: 'ok' })
                break
        }
    }
})

// send message to content-script
function sendToContentScript(message) {
    const id = message.id ? message.id : 0
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
        curMethod = ''
        // message
        const callBack = window.tanglepayCallBack[message.cmd + '_' + id]
        callBack && callBack(message)
        window.tanglepayCallBack[message.cmd + '_' + id] = null
    }
}
