import { Base, IotaSDK, API_URL, Trace } from '@tangle-pay/common'
import BigNumber from 'bignumber.js'
import { Toast } from './components/Toast'
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
    async iota_connect(origin, expires) {
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
            })

            Trace.dappConnect(origin.replace(/.+\/\//, ''), curWallet.address, curWallet.nodeId, IotaSDK.curNode.token)
        }
    },
    async iota_sign(origin, expires, content, password) {
        const curWallet = await this.getCurWallet()
        const res = await IotaSDK.iota_sign({ ...curWallet, password }, content)
        if (res) {
            this.sendMessage('iota_sign', res)
        } else {
            this.sendErrorMessage('iota_sign', {
                msg: 'fail'
            })
        }
    },
    async iota_getPublicKey(origin, expires) {
        try {
            const curWallet = await this.getCurWallet()
            this.sendMessage('iota_getPublicKey', curWallet.publicKey)
        } catch (error) {
            this.sendErrorMessage('iota_getPublicKey', {
                msg: error.toString()
            })
        }
    },
    async eth_getBalance(origin, { assetsList, addressList }) {
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
            this.sendMessage('eth_getBalance', assetsData)
        } catch (error) {
            Toast.hideLoading()
            this.sendErrorMessage('eth_getBalance', {
                msg: error.toString()
            })
        }
    },
    async iota_getBalance(origin, { assetsList, addressList }) {
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
            this.sendMessage('iota_getBalance', assetsData)
        } catch (error) {
            Toast.hideLoading()
            this.sendErrorMessage('iota_getBalance', {
                msg: error.toString()
            })
        }
    },
    async iota_accounts(origin) {
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

                this.sendMessage('iota_accounts', addressList)
            } else {
                this.sendErrorMessage('iota_accounts', {
                    msg: 'Wallet not authorized',
                    status: 2
                })
            }
            Toast.hideLoading()
        } catch (error) {
            Toast.hideLoading()
            this.sendErrorMessage('iota_accounts', {
                msg: error.toString(),
                status: 3
            })
        }
    },
    async iota_merge_nft() {
        Base.push('assets/nftMerge')
    },
    sendToContentScript(cmd, { method, response, code = 200 }) {
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
                sendData: {
                    cmd,
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
    sendMessage(method, response) {
        this.sendToContentScript('iota_request', { method, response })
        this.closeWindow()
    },
    sendErrorMessage(method, response) {
        this.sendToContentScript('iota_request', { method, response, code: -1 })
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
