import { Base, IotaSDK, API_URL } from '@tangle-pay/common'
import BigNumber from 'bignumber.js'
import { Toast } from './components/Toast'
export default {
    async connect(url) {
        const query = Base.handlerParams(url) || {}
        let { cmd, method, params, origin, isKeepPopup } = query
        switch (cmd) {
            case 'iota_request':
                this.isKeepPopup = isKeepPopup == 1
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
        const bg = window.chrome?.extension?.getBackgroundPage()
        let walletsList = []
        if (bg) {
            walletsList = await bg.getBackgroundData('common.walletsList')
        }
        const list = await IotaSDK.getWalletList(walletsList)
        const curWallet = (list || []).find((e) => e.isSelected)
        return curWallet
    },
    async iota_connect() {
        const curWallet = await this.getCurWallet()
        if (curWallet.address) {
            await this.cacheBgAddressData('iota_connect', { address: curWallet.address })
            this.sendMessage('iota_connect', {
                address: curWallet.address
            })
        }
    },
    async iota_getBalance(origin, { assetsList, addressList }) {
        Toast.showLoading()
        try {
            // iota
            assetsList = assetsList || []
            let amount = BigNumber(0)
            if (assetsList.includes('iota')) {
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
            if (assetsList.includes('smr') || assetsList.includes('asmb')) {
                let eventConfig = await fetch(`${API_URL}/events.json?v=${new Date().getTime()}`).then((res) =>
                    res.json()
                )
                eventConfig = eventConfig?.rewards || {}
                const othersRes = await IotaSDK.getAddressListRewards(addressList)
                for (const i in othersRes) {
                    const { symbol, amount } = othersRes[i]
                    const { ratio, unit } = eventConfig[symbol]
                    if (assetsList.includes(unit.toLocaleLowerCase())) {
                        othersDic[symbol] = othersDic[symbol] || {
                            amount: 0,
                            symbol,
                            icon: `http://api.iotaichi.com/icon/${unit}.png`
                        }
                        othersDic[symbol].amount += amount * ratio
                    }
                }
            }

            const assetsData = {
                amount,
                collectibles,
                others: Object.values(othersDic)
            }
            await this.cacheBgAddressData('iota_getBalance', assetsData)

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
            if (curWallet.address) {
                const res = await IotaSDK.getValidAddresses(curWallet)
                addressList = res?.addressList || []
                if (addressList.length === 0) {
                    addressList = [curWallet.address]
                }
            }
            if (addressList.length > 0) {
                await this.cacheBgAddressData('iota_accounts', addressList)
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
    cacheBgData(key, cacheData) {
        const bg = window.chrome?.extension?.getBackgroundPage()
        if (bg) {
            bg.setBackgroundData(key, cacheData)
        }
    },
    async cacheBgAddressData(key, cacheData) {
        const curWallet = await this.getCurWallet()
        this.cacheBgData(`${key}_${curWallet.address}`, cacheData)
    },
    sendMessage(method, response) {
        const bg = window.chrome?.extension?.getBackgroundPage()
        if (bg) {
            bg.sendToContentScript({
                cmd: 'iota_request',
                code: 200,
                data: {
                    method,
                    response
                }
            })
        }
        if (!this.isKeepPopup) {
            this.closeWindow()
        }
    },
    sendErrorMessage(method, response) {
        const bg = window.chrome?.extension?.getBackgroundPage()
        if (bg) {
            bg.sendToContentScript({
                cmd: 'iota_request',
                code: -1,
                data: {
                    method,
                    response
                }
            })
        }
        this.closeWindow()
    },
    closeWindow() {
        const bg = window.chrome?.extension?.getBackgroundPage()
        if (bg && bg.tanglepayDialog) {
            window.chrome.windows.remove(bg.tanglepayDialog)
        }
    }
}
