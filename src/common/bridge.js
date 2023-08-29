import { Base, IotaSDK, API_URL, Trace } from '@tangle-pay/common'
import BigNumber from 'bignumber.js'
import { Toast } from './components/Toast'
import { send } from '@iota/iota.js-next'
import { Converter } from '@iota/util.js-next'
export default {
    async connect(url) {
        const query = Base.handlerParams(url) || {}
        let { cmd, method, params, origin } = query
        switch (cmd) {
            case 'iota_request':
                if (!IotaSDK.client) {
                    return this.sendErrorMessage(method, {
                        msg: 'Wallet initialization failed',
                        status: 1
                    })
                }
                try {
                    params = JSON.parse(params)
                } catch (error) {
                    params = {}
                }
                this[method] && this[method](decodeURIComponent(origin), params)
                break
            default:
                break
        }
    },
    async getCurWallet() {
        const list = await IotaSDK.getWalletList()
        const curWallet = (list || []).find((e) => e.isSelected)
        return curWallet
    },
    async iota_connect(origin, expires, reqId = 0) {
        const curWallet = await this.getCurWallet()
        if (curWallet.address) {
            const key = `${origin}_iota_connect_${curWallet.address}_${curWallet.nodeId}`
            const obj = {
                address: curWallet.address,
                nodeId: curWallet.nodeId
            }
            if (IotaSDK.checkWeb3Node(curWallet.nodeId)) {
                obj.chainId = await IotaSDK.client.eth.getChainId()
            }
            this.cacheBgData(key, { ...obj, expires: new Date().getTime() + parseInt(expires || 0) })
            this.sendMessage('iota_connect', {
                ...obj
            },reqId)

            Trace.dappConnect(origin.replace(/.+\/\//, ''), curWallet.address, curWallet.nodeId, IotaSDK.curNode.token)
        }
    },
    async iota_sign(origin, expires, content, password, reqId = 0) {
        const curWallet = await this.getCurWallet()
        const res = await IotaSDK.iota_sign({ ...curWallet, password }, content)
        if (res) {
            this.sendMessage('iota_sign', res, reqId)
        } else {
            this.sendErrorMessage('iota_sign', {
                msg: 'fail'
            })
        }
    },
    async iota_getPublicKey(origin, expires, reqId = 0) {
        try {
            const curWallet = await this.getCurWallet()
            this.sendMessage('iota_getPublicKey', curWallet.publicKey, reqId)
        } catch (error) {
            this.sendErrorMessage('iota_getPublicKey', {
                msg: error.toString()
            },reqId)
        }
    },
<<<<<<< HEAD
    async iota_im_authorized(curWallet, password, dappOrigin, reqId = 0) {
        try {
            console.log('iota_im_authorized called',curWallet, password, dappOrigin, reqId)
=======
    async iota_im(curWallet, password, dappOrigin, reqId = 0) {
        try {
>>>>>>> a34aad2fe7bbd4cf904096d41549091b64672889
            const seed = await IotaSDK.getSeed(curWallet.seed, password)
            const bytes = seed.toBytes()
            const hex = Converter.bytesToHex(bytes)
            this.sendToContentScriptGeneric('iota_im_authorized', {hex, dappOrigin, address: curWallet.address, reqId}, dappOrigin, reqId)
        } catch (error) {
<<<<<<< HEAD
            console.log('iota_im_authorized error',error)
=======
>>>>>>> a34aad2fe7bbd4cf904096d41549091b64672889
            this.sendToContentScriptGeneric('iota_im_authorized', false)
        }
    },

    async eth_getBalance(origin, { assetsList, addressList }, reqId = 0) {
        Toast.showLoading()
        try {
            // iota
            assetsList = assetsList || []
            let amount = BigNumber(0)
            if (assetsList.includes('evm') && IotaSDK.isWeb3Node) {
                if (!IotaSDK.client || !IotaSDK?.client?.eth) {
                    throw 'network error.'
                }
                const res = await Promise.all(addressList.map((e) => IotaSDK.client.eth.getBalance(e)))
                res.forEach((e) => {
                    amount = amount.plus(e)
                })
            }
            amount = Number(amount)
            const assetsData = {
                amount
            }
            const curWallet = await this.getCurWallet()
            const key = `${origin}_eth_getBalance_${curWallet?.address}_${curWallet?.nodeId}`
            // this.cacheBgData(key, assetsData)
            Toast.hideLoading()
            this.sendMessage('eth_getBalance', assetsData, reqId)
        } catch (error) {
            Toast.hideLoading()
            this.sendErrorMessage('eth_getBalance', {
                msg: error.toString()
            })
        }
    },
    async iota_getBalance(origin, { assetsList, addressList }, reqId) {
        Toast.showLoading()
        try {
            // iota
            assetsList = assetsList || []
            let amount = BigNumber(0)
            const curWallet = await this.getCurWallet()
            if (assetsList.includes('iota') && !IotaSDK.checkSMR(curWallet.nodeId) && !IotaSDK.isWeb3Node) {
                const res = await Promise.all(addressList.map((e) => IotaSDK.client.address(e)))
                res.forEach((e) => {
                    amount = amount.plus(e.balance)
                })
            }
            amount = Number(amount)

            // soonaverse
            let collectibles = []
            if (assetsList.includes('soonaverse')) {
                collectibles = await IotaSDK.getNfts(addressList)
            }

            // stake
            let othersDic = {}
            if (IotaSDK.checkSMR(curWallet.nodeId)) {
                if (assetsList.includes('smr')) {
                    const smrAessets = (await IotaSDK.getBalance(curWallet, addressList)) || []
                    othersDic.smr = {
                        amount: smrAessets.find((e) => e.token === IotaSDK.curNode?.token)?.realBalance,
                        symbol: 'smr',
                        icon: `https://api.iotaichi.com/icon/SMR.png`
                    }
                }
            } else {
                if (assetsList.includes('smr') || assetsList.includes('asmb')) {
                    let eventConfig = await fetch(`${API_URL}/events.json?v=${new Date().getTime()}`).then((res) =>
                        res.json()
                    )
                    eventConfig = eventConfig?.rewards || {}
                    const othersRes = await IotaSDK.getAddressListRewards(addressList)
                    for (const i in othersRes) {
                        const { symbol, amount, minimumReached } = othersRes[i]
                        const { ratio, unit } = eventConfig[symbol]
                        if (minimumReached && assetsList.includes(unit.toLocaleLowerCase())) {
                            othersDic[symbol] = othersDic[symbol] || {
                                amount: 0,
                                symbol,
                                icon: `https://api.iotaichi.com/icon/${unit}.png`
                            }
                            othersDic[symbol].amount += amount * ratio
                        }
                    }
                }
            }

            const assetsData = {
                amount,
                collectibles,
                others: Object.values(othersDic)
            }
            const key = `${origin}_iota_getBalance_${curWallet?.address}_${curWallet?.nodeId}`
            // this.cacheBgData(key, assetsData)

            Toast.hideLoading()
            this.sendMessage('iota_getBalance', assetsData, reqId)
        } catch (error) {
            Toast.hideLoading()
            this.sendErrorMessage('iota_getBalance', {
                msg: error.toString()
            })
        }
    },
    async iota_accounts(origin, reqId = 0) {
        Toast.showLoading()
        try {
            const curWallet = await this.getCurWallet()
            let addressList = []
            if (IotaSDK.isWeb3Node) {
                addressList = [curWallet.address]
            } else {
                if (curWallet.address) {
                    const res = await IotaSDK.getValidAddresses(curWallet)
                    addressList = res?.addressList || []
                    if (addressList.length === 0) {
                        addressList = [curWallet.address]
                    }
                }
            }
            if (addressList.length > 0) {
                const key = `${origin}_iota_accounts_${curWallet?.address}_${curWallet?.nodeId}`
                this.cacheBgData(key, addressList)

                this.sendMessage('iota_accounts', addressList, reqId)
            } else {
                this.sendErrorMessage('iota_accounts', {
                    msg: 'Wallet not authorized',
                    status: 2
                }, reqId)
            }
            Toast.hideLoading()
        } catch (error) {
            Toast.hideLoading()
            this.sendErrorMessage('iota_accounts', {
                msg: error.toString(),
                status: 3
            }, reqId)
        }
    },
    async iota_merge_nft() {
        Base.push('assets/nftMerge')
    },
    sendToContentScriptSetData(key,value) {
        const sendMessage = window.chrome?.runtime?.sendMessage
        if (sendMessage) {
            sendMessage({
                cmd: `contentToBackground##bgDataSet`,
                sendData: {key,value}
            })
        }
    },
    async sendToContentScriptGetData(key) {
        const sendMessage = window.chrome?.runtime?.sendMessage
        if (sendMessage) {
            try {
                const value = await sendMessage({
                    cmd: `contentToBackground##bgDataGet`,
                    sendData: {key}
                })
                console.log('sendToContentScriptGetData',value)
                return value.data.payload;
            } catch (error) {
                console.log('sendToContentScriptGetData error',error)
                return null;
            }
        }
    },
    async sendToContentScriptGetUUID() {
        const sendMessage = window.chrome?.runtime?.sendMessage
        if (sendMessage) {
            try {
                const value = await sendMessage({
                    cmd: `contentToBackground##bgUuidGet`
                })
                console.log('sendToContentScriptGetUUID',value)
                return value.data.payload;
            } catch (error) {
                console.log('sendToContentScriptGetUUID error',error)
                return null;
            }
        }
    },
    sendToContentScriptGeneric(cmd, data, dappOrigin, reqId) {
        const sendMessage = window.chrome?.runtime?.sendMessage
        if (sendMessage) {
            sendMessage({
                cmd: `contentToBackground##${cmd}`,
                id:reqId,
                dappOrigin,
                sendData: data
            })
        }
    },
    sendToContentScript(cmd, { method, response, code = 200 }, reqId = 0) {
        // V2
        // const bg = window.chrome?.extension?.getBackgroundPage()
        // if (bg) {
        //     bg.sendToContentScript({
        //         cmd,
        //         code: 200,
        //         data: {
        //             method,
        //             response
        //         }
        //     })
        // }
        // V3
        const sendMessage = window.chrome?.runtime?.sendMessage
        if (sendMessage) {
            sendMessage({
                cmd: `contentToBackground##popupBridgeToBackground`,
                id: reqId,
                sendData: {
                    cmd,
                    id:reqId,
                    code,
                    data: {
                        method,
                        response
                    }
                }
            })
        }
    },
    sendEvt(event, response) {
        this.sendToContentScript('iota_event', {
            method: event,
            response
        })
    },
    cacheBgData(key, cacheData) {
        // V2
        // const bg = window.chrome?.extension?.getBackgroundPage()
        // if (bg) {
        //     bg.setBackgroundData(key, cacheData)
        // }
        // V3
        Base.setLocalData(key, cacheData)
    },
    sendMessage(method, response, reqId = 0) {
        this.sendToContentScript('iota_request', { method, response }, reqId)
        this.closeWindow()
    },
    sendErrorMessage(method, response, reqId = 0) {
        this.sendToContentScript('iota_request', { method, response, code: -1 }, reqId)
        this.closeWindow()
    },
    closeWindow() {
        // v2
        // const bg = window.chrome?.extension?.getBackgroundPage()
        // if (bg && bg.tanglepayDialog) {
        //     window.chrome.windows.remove(bg.tanglepayDialog)
        // }
        // v3
        const sendMessage = window.chrome?.runtime?.sendMessage
        if (sendMessage) {
            sendMessage({
                cmd: `contentToBackground##popupBridgeCloseWindow`
            })
        }
    }
}
