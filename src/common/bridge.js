import { Base, IotaSDK, API_URL } from '@tangle-pay/common'
import BigNumber from 'bignumber.js'
import { Toast } from './components/Toast'
export default {
    async connect(url) {
        // url = `?cmd=iota_request&method=iota_getBalance&params=%5B%22iota1qzrhx0ey6w4a9x0xg3zxagq2ufrw45qv8nlv24tkpxeetk864a4rkewh7e5%22%2C%22iota1qry9wkw0ezjsms6rvfp24fq8arpd2hu0udaz5mh7ncsjte5z9lhz7w3nxvu%22%5D`
        const query = Base.handlerParams(url) || {}
        let { cmd, method, params } = query
        switch (cmd) {
            case 'iota_request':
                await IotaSDK.init(1)
                this[method] && this[method](JSON.parse(params))
                break
            default:
                break
        }
    },
    async iota_getBalance(addressList) {
        if (!IotaSDK.client) {
            return 0
        }
        Toast.showLoading()
        try {
            const res = await Promise.all(addressList.map((e) => IotaSDK.client.address(e)))
            let amount = BigNumber(0)
            res.forEach((e) => {
                amount = amount.plus(e.balance)
            })
            amount = Number(amount)
            let eventConfig = await fetch(`${API_URL}/events.json?v=${new Date().getTime()}`).then((res) => res.json())
            eventConfig = eventConfig?.rewards || {}
            console.log(eventConfig)
            const othersRes = await IotaSDK.getAddressListRewards(addressList)
            const othersDic = {}
            for (const i in othersRes) {
                const { symbol, amount } = othersRes[i]
                const { ratio, unit } = eventConfig[symbol]
                othersDic[symbol] = othersDic[symbol] || {
                    amount: 0,
                    symbol,
                    icon: `http://api.iotaichi.com/icon/${unit}.png`
                }
                othersDic[symbol].amount += amount * ratio
            }
            const collectibles = await IotaSDK.getNfts(addressList)
            Toast.hideLoading()
            this.sendMessage('iota_getBalance', {
                amount,
                collectibles,
                others: Object.values(othersDic)
            })
        } catch (error) {
            this.sendErrorMessage('iota_getBalance', {
                msg: error.toString()
            })
        }
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
    }
}
