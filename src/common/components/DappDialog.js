import React, { useState, useEffect, useRef } from 'react'
import { Button, Mask, Form, Input } from 'antd-mobile'
import { I18n, IotaSDK, Base } from '@tangle-pay/common'
import { useGetNodeWallet, useGetAssetsList, useChangeNode } from '@tangle-pay/store/common'
import { useStore } from '@tangle-pay/store'
import BigNumber from 'bignumber.js'
import { Toast } from './Toast'
import Bridge from '@/common/bridge'
import { useGetParticipationEvents } from '@tangle-pay/store/staking'
import { Unit } from '@iota/unit-converter'
import { GasDialog } from '@/common/components/gasDialog'
import { context, checkWalletIsPasswordEnabled } from '@tangle-pay/domain'

const contractTokenMethod = ['approve', 'transfer']

export const DappDialog = () => {
    const gasDialog = useRef()
    const [isShow, setShow] = useState(false)
    const [isRequestAssets] = useStore('common.isRequestAssets')
    const [canShowDappDialog] = useStore('common.canShowDappDialog')
    useGetParticipationEvents()
    const [init, setInit] = useState(false)
    const [contentH, setContenth] = useState(600)
    const [password, setPassword] = useState('')
    const [dappData, setDappData] = useState({
        texts: []
    })
    const [deepLink, setDeepLink] = useState('')
    const selectTimeHandler = useRef()
    const [curWallet] = useGetNodeWallet()
    useGetAssetsList(curWallet)
    const [assetsList] = useStore('common.assetsList')
    const [curNodeId] = useStore('common.curNodeId')
    const changeNode = useChangeNode()
    const [gasInfo, setGasInfo] = useState({})
    const isLedger = curWallet.type == 'ledger'
    const [isWalletPassowrdEnabled, setIsWalletPassowrdEnabled] = useState(true)
    const ensureWalletStatus = () => {
        checkWalletIsPasswordEnabled(curWallet.id).then((res) => {
            setIsWalletPassowrdEnabled(res)
            setPassword(context.state.pin)
        })
    }
    useEffect(() => {
        ensureWalletStatus()
    }, [curWallet.id, canShowDappDialog])
    const show = () => {
        ensureWalletStatus()
        // requestAnimationFrame(() => {
        setShow(true)
        // })
    }
    const hide = () => {
        setShow(false)
        Toast.hideLoading()
    }
    const onHandleCancel = async ({ type, reqId }) => {
        switch (type) {
            case 'iota_sign':
            case 'iota_connect':
            case 'iota_sendTransaction':
            case 'eth_sendTransaction':
                Bridge.sendErrorMessage(
                    type,
                    {
                        msg: 'cancel'
                    },
                    reqId
                )
                break

            default:
                break
        }
    }
    const onExecute = async ({ address, return_url, content, type, amount, origin, expires, taggedData, contract, foundryData, tag, nftId, reqId, dataPerRequest }) => {
        const noPassword = ['iota_connect', 'iota_changeAccount', 'iota_getPublicKey', 'iota_getWalletType']
        if (!noPassword.includes(type)) {
            if (!isLedger) {
                const isPassword = await IotaSDK.checkPassword(curWallet.seed, password)
                if (!isPassword) {
                    return Toast.error(I18n.t('assets.passwordError'))
                }
            }
        }
        let messageId = ''
        switch (type) {
            case 'iota_sendTransaction':
            case 'eth_sendTransaction':
            case 'send':
                {
                    let mainBalance = 0
                    let curToken = IotaSDK.curNode?.token
                    if (contract) {
                        curToken = (IotaSDK.curNode.contractList || []).find((e) => e.contract === contract)?.token || IotaSDK.curNode?.token
                    }
                    let assets = assetsList.find((e) => e.name === curToken) || {}
                    if (foundryData) {
                        mainBalance = assetsList.find((e) => e.name === IotaSDK.curNode?.token)?.realBalance
                        assets = assetsList.find((e) => e.name === foundryData.symbol)
                        if (!assets) {
                            assets = {
                                realBalance: 0,
                                decimal: foundryData.decimals,
                                name: foundryData.symbol
                            }
                        }
                    }
                    let realBalance = BigNumber(assets.realBalance || 0)
                    if (IotaSDK.checkSMR(curWallet.nodeId) && !assets.isSMRToken) {
                        realBalance = BigNumber(assets.realAvailable || 0)
                    }
                    let residue = Number(realBalance.minus(amount)) || 0
                    let decimal = Math.pow(10, assets.decimal)
                    if (!IotaSDK.checkWeb3Node(curWallet.nodeId) && !IotaSDK.checkSMR(curWallet.nodeId)) {
                        if (amount < decimal) {
                            return Toast.error(I18n.t('assets.sendBelow1Tips'))
                        }
                    }
                    if (residue < 0) {
                        return Toast.error(I18n.t('assets.balanceError'))
                    }
                    if (!IotaSDK.checkWeb3Node(curWallet.nodeId) && !IotaSDK.checkSMR(curWallet.nodeId)) {
                        if (residue < decimal && residue != 0) {
                            return Toast.error(I18n.t('assets.residueBelow1Tips'))
                        }
                    }
                    Toast.showLoading()
                    try {
                        // nft
                        if (nftId) {
                            amount = 1
                            residue = 0
                            realBalance = 0
                            decimal = 0
                        }
                        const res = await IotaSDK.send({ ...curWallet, password }, address, amount, {
                            domain: origin,
                            contract: contract || assets?.contract,
                            contractDetail: dappData.contractDetail,
                            token: assets?.name,
                            taggedData,
                            residue,
                            realBalance: Number(realBalance),
                            awaitStake: true,
                            tokenId: foundryData?.tokenId,
                            decimal: assets?.decimal,
                            mainBalance,
                            tag,
                            metadata: dataPerRequest?.metadata,
                            nftId,
                            gas: gasInfo.gasLimit,
                            gasPrice: gasInfo.gasPriceWei
                        })
                        if (!res) {
                            throw I18n.t('user.nodeError')
                        }
                        messageId = res.messageId
                        // Toast.hideLoading()
                        if (type === 'iota_sendTransaction' || type === 'eth_sendTransaction') {
                            Bridge.sendMessage(type, res, reqId)
                        } else {
                            // Toast.success(I18n.t('assets.sendSucc'))
                        }
                    } catch (error) {
                        Toast.hideLoading()
                        if (/Failed to fetch/i.test(error.toString())) {
                            IotaSDK.refreshAssets()
                            setTimeout(() => {
                                IotaSDK.refreshAssets()
                            }, 10000)
                        } else {
                            if (type === 'iota_sendTransaction' || type === 'eth_sendTransaction') {
                                Bridge.sendErrorMessage(type, String(error), reqId)
                            } else {
                                Toast.error(String(error))
                                // Toast.error(
                                //     `${String(error)}---amount:${amount}---residue:${residue}---realBalance:${Number(
                                //         realBalance
                                //     )}`,
                                //     {
                                //         duration: 5000
                                //     }
                                // )
                            }
                        }
                    }
                }
                break
            case 'sign':
                try {
                    messageId = await IotaSDK.iota_sign({ ...curWallet, password }, content)
                    Toast.hideLoading()
                } catch (error) {
                    Toast.hideLoading()
                    Toast.error(error.toString(), {
                        duration: 5000
                    })
                }
                break
            case 'iota_getPublicKey':
                {
                    await Bridge.iota_getPublicKey(origin, expires, reqId)
                }
                break
            case 'iota_getWalletType':
                {
                    await Bridge.iota_getWalletType(origin, expires, reqId)
                }
                break
            case 'iota_changeAccount':
                {
                    Bridge.sendMessage(
                        type,
                        {
                            code: 200,
                            address: curWallet.address,
                            nodeId: curWallet.nodeId,
                            network: IotaSDK.nodes.find((e) => e.id == curWallet.nodeId)?.network
                        },
                        reqId
                    )
                    Toast.hideLoading()
                }
                break
            case 'iota_connect':
                {
                    await Bridge.iota_connect(origin, expires, reqId)
                }
                break
            case 'iota_sign':
                {
                    await Bridge.iota_sign(origin, expires, content, password, reqId)
                }
                break
            default:
                break
        }
        if (messageId && return_url) {
            return_url = decodeURIComponent(return_url)
            const url = `${return_url}${/\?/.test(return_url) ? '&' : '?'}message_id=${messageId}`
            Base.push(url, { blank: true })
        }
        hide()
        Bridge.closeWindow()
    }
    const checkDeepLink = (url) => {
        return /^tanglepay:\/\/.+/.test(url)
    }
    const handleUrl = async (url, password) => {
        if (!url) return
        if (!checkDeepLink(url)) {
            return
        }
        const res = Base.handlerParams(url)
        const regex = /(<([^>]+)>)/gi
        for (const i in res) {
            res[i] = (res[i] || '').replace(/#\/.+/, '').replace(regex, '')
        }
        let { network, value, unit, return_url, item_desc = '', merchant = '', content = '', origin = '', expires, taggedData = '', assetId = '', nftId = '', tag = '', gas = '', reqId = 0 } = res
        let toNetId
        if (!network) {
            const path = url.replace('tanglepay://', '').split('?')[0]
            let [, address] = (path || '').split('/')
            if (/^iota/.test(address)) {
                network = 'mainnet'
            } else if (/^atoi/.test(address)) {
                network = 'devnet'
            } else if (/^smr/.test(address)) {
                network = 'shimmer'
            } else if (/^rms/.test(address)) {
                network = 'testnet'
            }
        }
        if (network) {
            await IotaSDK.getNodes()
            toNetId = IotaSDK.nodes.find((e) => e.network == network)?.id
        }
        if (toNetId && parseInt(toNetId) !== parseInt(curNodeId)) {
            await changeNode(toNetId)
            return
        } else if (!curWallet.address) {
            selectTimeHandler.current = setTimeout(() => {
                hide()
                Base.push('/assets/wallets', { nodeId: toNetId || '' })
            }, 500)
        } else {
            if (!password || !/password_/.test(password)) {
                hide()
                return
            }
            setDeepLink('')
            clearTimeout(selectTimeHandler.current)
            const path = url.replace('tanglepay://', '').split('?')[0]
            setInit(true)
            if (path) {
                let [type, address] = path.split('/')
                switch (type) {
                    case 'iota_sendTransaction': //sdk send
                    case 'eth_sendTransaction':
                    case 'send':
                        {
                            value = BigNumber(value || 0).valueOf()
                            if (nftId) {
                                value = 1
                            }
                            let foundryData = null
                            if (!value && !taggedData) {
                                return Toast.error('Required: value')
                            }
                            if (!address) {
                                return Toast.error('Required: address')
                            }
                            address = address.toLocaleLowerCase()
                            let showValue = ''
                            let showUnit = ''
                            let sendAmount = 0
                            let contract = ''
                            let contractDetail = null
                            let abiFunc = ''
                            let abiParams = []
                            let gasFee = ''
                            let contractAmount = ''
                            let showContractAmount = ''
                            if (IotaSDK.checkWeb3Node(toNetId || curNodeId)) {
                                setInit(false)
                                Toast.showLoading()
                                unit = unit || 'wei'
                                let curToken = IotaSDK.curNode?.token
                                sendAmount = Number(new BigNumber(value || 0))
                                sendAmount = sendAmount || 0
                                showValue = IotaSDK.client.utils.fromWei(IotaSDK.getNumberStr(sendAmount), 'ether')
                                // contract
                                if (taggedData) {
                                    contract = address
                                    const { functionName, params, web3Contract, isErc20 } = await IotaSDK.getAbiParams(address, taggedData)
                                    for (const i in params) {
                                        if (Object.hasOwnProperty.call(params, i) && /^\d$/.test(i)) {
                                            abiParams.push(params[i])
                                        }
                                    }
                                    if (sendAmount) {
                                        abiParams.push(`${showValue} ${curToken}`)
                                    }
                                    abiFunc = functionName
                                    switch (functionName) {
                                        case 'transfer':
                                            address = params[0]
                                            contractAmount = params[1]
                                            break
                                        case 'approve':
                                            const contractGasLimit = (IotaSDK.curNode.contractList || []).find((e) => e.contract === contract)?.gasLimit || 0
                                            const { gasPrice } = await IotaSDK.getGasLimit(contractGasLimit, curWallet.address, 0)
                                            gasFee = IotaSDK.client.utils.fromWei(IotaSDK.getNumberStr(BigNumber(gasPrice).valueOf()), 'ether')
                                            gasFee = `${gasFee} ${IotaSDK.curNode.token}`
                                            address = params[0]
                                            contractAmount = params[1]
                                            break
                                        default:
                                            break
                                    }
                                    contractAmount = Number(new BigNumber(contractAmount))
                                    try {
                                        if (web3Contract?.methods?.symbol) {
                                            curToken = await web3Contract.methods.symbol().call()
                                        } else {
                                            curToken = IotaSDK.curNode?.token
                                        }
                                        let decimals = 0
                                        if (web3Contract?.methods?.decimals) {
                                            decimals = await web3Contract.methods.decimals().call()
                                        }
                                        if (isErc20) {
                                            IotaSDK.importContract(contract, curToken, decimals)
                                        }
                                        showContractAmount = new BigNumber(contractAmount).div(BigNumber(10).pow(decimals)).valueOf()
                                    } catch (error) {}
                                    Toast.hideLoading()
                                } else {
                                }
                                showUnit = curToken
                                Toast.showLoading()
                                let [gasPrice, gasLimit] = await Promise.all([
                                    IotaSDK.client.eth.getGasPrice(),
                                    IotaSDK.getDefaultGasLimit(curWallet.address, taggedData ? address : '', IotaSDK.getNumberStr(sendAmount || 0), taggedData)
                                ])
                                if (taggedData) {
                                    if (IotaSDK.curNode?.contractGasPriceRate) {
                                        gasPrice = IotaSDK.getNumberStr(parseInt(gasPrice * IotaSDK.curNode?.contractGasPriceRate))
                                    }
                                    if (IotaSDK.curNode?.contractGasLimitRate) {
                                        gasLimit = IotaSDK.getNumberStr(parseInt(gasLimit * IotaSDK.curNode?.contractGasLimitRate))
                                    }
                                } else {
                                    if (IotaSDK.curNode?.gasPriceRate) {
                                        gasPrice = IotaSDK.getNumberStr(parseInt(gasPrice * IotaSDK.curNode?.gasPriceRate))
                                    }
                                    if (IotaSDK.curNode?.gasLimitRate) {
                                        gasLimit = IotaSDK.getNumberStr(parseInt(gasLimit * IotaSDK.curNode?.gasLimitRate))
                                    }
                                }
                                const gasPriceWei = gasPrice
                                gasLimit = gasLimit || 21000
                                let totalWei = new BigNumber(gasPrice).times(gasLimit)
                                totalWei = IotaSDK.getNumberStr(totalWei.valueOf())
                                const totalEth = IotaSDK.client.utils.fromWei(totalWei, 'ether')
                                gasPrice = IotaSDK.client.utils.fromWei(gasPrice, 'gwei')
                                const total = IotaSDK.client.utils.fromWei(totalWei, 'gwei')
                                setGasInfo({
                                    gasLimit,
                                    gasPrice,
                                    gasPriceWei,
                                    total,
                                    totalEth
                                })

                                if (abiFunc && !contractTokenMethod.includes(abiFunc)) {
                                    contractDetail = {
                                        abiFunc,
                                        value: showValue,
                                        unit: showUnit
                                    }
                                }

                                setInit(true)
                                Toast.hideLoading()
                            } else {
                                if (IotaSDK.checkSMR(toNetId || curNodeId)) {
                                    if (nftId) {
                                        value = 1
                                        showValue = 1
                                        unit = Base.handleAddress(nftId)
                                        setInit(false)
                                        Toast.showLoading()
                                        if (IotaSDK?.IndexerPluginClient?.nft) {
                                            unit = []
                                            const getNftInfo = async (curNftId) => {
                                                let nftInfo = await IotaSDK.IndexerPluginClient.nft(curNftId)
                                                if (nftInfo?.items?.[0]) {
                                                    nftInfo = await IotaSDK.client.output(nftInfo?.items?.[0])

                                                    let info = (nftInfo?.output?.immutableFeatures || []).find((d) => {
                                                        return d.type == 2
                                                    })
                                                    if (info && info.data) {
                                                        try {
                                                            info = IotaSDK.hexToUtf8(info.data)
                                                            info = JSON.parse(info)
                                                            unit.push(info.name)
                                                        } catch (error) {
                                                            console.log(error)
                                                        }
                                                    }
                                                }
                                            }
                                            const nfts = nftId.split(',')
                                            await Promise.all(nfts.map((e) => getNftInfo(e)))
                                            unit = unit.join(' , ')
                                        }
                                        showUnit = unit
                                        setInit(true)
                                        Toast.hideLoading()
                                    } else if (assetId) {
                                        setInit(false)
                                        Toast.showLoading()
                                        foundryData = await IotaSDK.foundry(assetId)
                                        setInit(true)
                                        Toast.hideLoading()
                                        foundryData = IotaSDK.handleFoundry(foundryData)
                                        foundryData.tokenId = assetId
                                        unit = (foundryData.symbol || '').toLocaleUpperCase()
                                        showValue = value / Math.pow(10, foundryData.decimals || 0)
                                        sendAmount = value
                                        showUnit = unit
                                    } else if (IotaSDK.isIotaStardust(curNodeId)){
                                        const iotaDecimal = IotaSDK.curNode?.decimal || 6
                                        unit = 'IOTA'
                                        showValue = Base.formatNum(BigNumber(value).div(Math.pow(10, iotaDecimal)).valueOf(), iotaDecimal)
                                        if(parseFloat(showValue) < Math.pow(10, -iotaDecimal)) {
                                            showValue = Math.pow(10, -iotaDecimal)
                                        }
                                        sendAmount = BigNumber(showValue).times(Math.pow(10, iotaDecimal)).valueOf()
                                        showUnit = unit
                                    }else {
                                        unit = unit || 'SMR'
                                        if (!['SMR', 'Glow', 'IOTA'].includes(unit)) {
                                            unit = 'SMR'
                                        }
                                        showValue = value
                                        sendAmount = unit !== 'Glow' ? Math.pow(10, IotaSDK.curNode?.decimal || 0) * value : value
                                        showUnit = unit
                                    }
                                } else {
                                    unit = unit || 'Mi'
                                    if (!Unit[unit]) {
                                        unit = 'Mi'
                                    }
                                    showValue = IotaSDK.convertUnits(value, unit, 'Mi')
                                    sendAmount = IotaSDK.convertUnits(value, unit, 'i')
                                    showUnit = 'MIOTA'
                                }
                            }

                            let str = I18n.t(abiFunc === 'approve' ? 'apps.approve' : 'apps.send')
                            if (abiFunc && abiFunc !== 'approve' && abiFunc !== 'transfer') {
                                str = I18n.t('apps.contractFunc').replace('#abiFunc#', abiFunc)
                            }
                            let fromStr = I18n.t('apps.sendFrom')
                            let forStr = I18n.t('apps.sendFor')
                            str = str.replace('#merchant#', merchant ? fromStr + merchant : '')
                            str = str.replace('#item_desc#', item_desc ? forStr + item_desc : '')
                            str = str.trim().replace('#address#', address)
                            str = str
                                .replace('#amount#', '<span class="fw600">' + showValue + '</span>')
                                .replace('#contractAmount#', '<span class="fw600">' + showContractAmount + '</span>')
                                .replace('#unit#', showUnit)
                                .replace(/\n/g, '<br/>')
                                .replace('#fee#', gasFee)
                            str = `${origin}<br/>` + str
                            const dataPerRequest = await Bridge.sendToContentScriptGetData('data_per_request_prefix_' + reqId)
                            setDappData({
                                texts: [{ text: str }],
                                return_url,
                                type,
                                amount: sendAmount,
                                address,
                                taggedData,
                                contract,
                                contractDetail: contractDetail,
                                foundryData,
                                tag,
                                nftId,
                                abiFunc,
                                abiParams,
                                gas,
                                reqId,
                                origin,
                                dataPerRequest
                            })
                            show()
                        }
                        break
                    case 'sign': //  deeplink sign
                        {
                            if (!content) {
                                return Toast.error('Required: content')
                            }
                            let str = I18n.t('apps.sign')
                                .trim()
                                .replace('#merchant#', merchant ? '\n' + merchant : '')
                                .replace('#content#', content)
                            const texts = [
                                {
                                    text: str.replace(/\n/g, '<br/>')
                                }
                            ]
                            setDappData({
                                texts,
                                return_url,
                                type,
                                content,
                                reqId,
                                origin
                            })
                            show()
                        }
                        break
                    case 'iota_getPublicKey':
                        {
                            Toast.showLoading()
                            // setDappData({
                            //     texts: [{ text: 'get public key' }],
                            //     type
                            // })
                            // show()
                            onExecute({ type, reqId })
                        }
                        break
                    case 'iota_getWalletType':
                        {
                            Toast.showLoading()
                            // setDappData({
                            //     texts: [{ text: 'get public key' }],
                            //     type
                            // })
                            // show()
                            onExecute({ type, reqId })
                        }
                        break
                    case 'iota_changeAccount': {
                        //sdk change account
                        Toast.showLoading()
                        onExecute({ type, reqId })
                        break
                    }
                    case 'iota_connect': // sdk connect
                        {
                            let str = I18n.t('apps.connect')
                                .trim()
                                .replace('#origin#', origin || '')
                                .replace('#address#', curWallet.address)
                            const texts = [
                                {
                                    text: str.replace(/\n/g, '<br/>')
                                }
                            ]
                            setDappData({
                                texts,
                                return_url,
                                type,
                                origin,
                                expires,
                                reqId
                            })
                            show()
                        }
                        break
                    case 'iota_sign': // sdk sign
                        {
                            if (!content) {
                                return Toast.error('Required: content')
                            }
                            let str = I18n.t('apps.sign')
                                .trim()
                                .replace('#merchant#', origin ? '\n' + origin : '')
                                .replace('#content#', content)
                            const texts = [
                                {
                                    text: str.replace(/\n/g, '<br/>')
                                }
                            ]
                            setDappData({
                                texts,
                                return_url,
                                type,
                                content,
                                origin,
                                expires,
                                reqId
                            })
                            show()
                        }
                        break
                    default:
                        break
                }
            }
        }
    }
    useEffect(() => {
        handleUrl(deepLink, curWallet.password)
    }, [JSON.stringify(curWallet), deepLink, curNodeId])
    useEffect(() => {
        if (dappData.type === 'iota_sendTransaction' || dappData.type === 'eth_sendTransaction' || dappData.type === 'send') {
            if (!IotaSDK.isNeedRestake) {
                isRequestAssets ? Toast.hideLoading() : Toast.showLoading()
            }
        }
        if (dappData.type === 'iota_connect') {
            isRequestAssets ? Toast.hideLoading() : Toast.showLoading()
        }
    }, [dappData.type, isRequestAssets])
    useEffect(() => {
        if (canShowDappDialog) {
            const params = Base.handlerParams(window.location.search)
            const url = params.url
            if (checkDeepLink(url)) {
                setInit(false)
                show()
                setDeepLink(url)
            }
            setContenth(document.getElementById('app').offsetHeight)
        }
    }, [canShowDappDialog])
    return (
        <Mask className='dapp-dialog' color='white' visible={isShow}>
            <div className='flex c column w100' style={{ height: contentH }}>
                {init && (
                    <div className='bgW w100 ph25 pv40' style={{ borderTopRightRadius: 16, borderTopLeftRadius: 16 }}>
                        <div className='bgS radius10 p15 mb20' style={{ maxHeight: '200px', overflow: 'auto' }}>
                            <span style={{ wordBreak: 'break-word' }}>
                                {dappData.texts.map((e) => {
                                    return (
                                        <div
                                            key={e.text}
                                            dangerouslySetInnerHTML={{
                                                __html: e.text
                                            }}
                                            // className={`${e.isBold ? 'fw600' : ''}`}
                                            style={{ lineHeight: '26px' }}>
                                            {/* {e.text} */}
                                        </div>
                                    )
                                })}
                            </span>
                        </div>
                        {['iota_sendTransaction', 'eth_sendTransaction', 'send'].includes(dappData.type) && IotaSDK.checkWeb3Node(curWallet.nodeId) ? (
                            <Form.Item noStyle>
                                <div className='flex row ac jsb pv10 mt5'>
                                    <div className='fz16'>{I18n.t('assets.estimateGasFee')}</div>
                                    <div className='flex row ac'>
                                        <div className='cS fz16 fw400 tr mr4 ellipsis' style={{ maxWidth: 122 }}>
                                            {gasInfo.totalEth}
                                        </div>
                                        {gasInfo.totalEth ? <div className='cS fz16 fw400 tr mr8'>{IotaSDK.curNode?.token}</div> : null}
                                        <div
                                            className='press cP fz16 fw400'
                                            onClick={() => {
                                                if (JSON.stringify(gasInfo) == '{}') {
                                                    return
                                                }
                                                gasDialog.current.show(gasInfo, (res) => {
                                                    setGasInfo(res)
                                                })
                                            }}>
                                            {I18n.t('assets.edit')}
                                        </div>
                                    </div>
                                </div>
                            </Form.Item>
                        ) : null}
                        {dappData.type !== 'iota_connect' && !isLedger && isWalletPassowrdEnabled ? (
                            <Form.Item className='pl0'>
                                <Input type='password' onChange={setPassword} placeholder={I18n.t('assets.passwordTips')} />
                            </Form.Item>
                        ) : null}
                        <div className='flex row jsb ac mt25'>
                            <Button
                                onClick={() => {
                                    onExecute(dappData)
                                }}
                                className='flex1 mr20'
                                style={{ '--border-radius': '30px' }}
                                color='primary'
                                size='small'>
                                {I18n.t(dappData.type !== 'iota_connect' ? 'apps.execute' : 'apps.ConnectBtn')}
                            </Button>
                            <Button
                                className='flex1 bgS'
                                onClick={() => {
                                    onHandleCancel(dappData)
                                    hide()
                                    Bridge.closeWindow()
                                }}
                                style={{ '--border-radius': '30px' }}
                                color='default'
                                size='small'>
                                {I18n.t(dappData.abiFunc == 'approve' ? 'apps.reject' : 'apps.cancel')}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <GasDialog dialogRef={gasDialog} />
        </Mask>
    )
}
