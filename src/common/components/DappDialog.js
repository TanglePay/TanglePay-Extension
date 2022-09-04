import React, { useState, useEffect, useRef } from 'react'
import { Button, Mask, Form, Input } from 'antd-mobile'
import { I18n, IotaSDK, Base } from '@tangle-pay/common'
import { useGetNodeWallet, useChangeNode } from '@tangle-pay/store/common'
import { useStore } from '@tangle-pay/store'
import BigNumber from 'bignumber.js'
import { Toast } from './Toast'
import Bridge from '@/common/bridge'

export const DappDialog = () => {
    const [isShow, setShow] = useState(false)
    const [isRequestAssets] = useStore('common.isRequestAssets')
    const [isRequestHis] = useStore('common.isRequestHis')
    const [init, setInit] = useState(false)
    const [contentH, setContenth] = useState(600)
    const [password, setPassword] = useState('')
    const [dappData, setDappData] = useState({
        texts: []
    })
    const [deepLink, setDeepLink] = useState('')
    const selectTimeHandler = useRef()
    const [curWallet] = useGetNodeWallet()
    const [assetsList] = useStore('common.assetsList')
    const [statedAmount] = useStore('staking.statedAmount')
    const [curNodeId] = useStore('common.curNodeId')
    const changeNode = useChangeNode()
    const show = () => {
        // requestAnimationFrame(() => {
        setShow(true)
        // })
    }
    const hide = () => {
        setShow(false)
        Toast.hideLoading()
    }
    const closeWindow = () => {
        const bg = window.chrome?.extension?.getBackgroundPage()
        if (bg && bg.tanglepayDialog) {
            window.chrome.windows.remove(bg.tanglepayDialog)
        }
    }
    const onHandleCancel = async ({ type }) => {
        switch (type) {
            case 'iota_sign':
            case 'iota_connect':
            case 'iota_sendTransaction':
                Bridge.sendErrorMessage(type, {
                    msg: 'cancel'
                })
                break

            default:
                break
        }
    }
    const onExecute = async ({
        address,
        return_url,
        content,
        type,
        amount,
        origin,
        isKeepPopup,
        expires,
        taggedData,
        contract
    }) => {
        const noPassword = ['iota_connect', 'iota_changeAccount', 'iota_getPublicKey']
        if (!noPassword.includes(type)) {
            const isPassword = await IotaSDK.checkPassword(curWallet.seed, password)
            if (!isPassword) {
                return Toast.error(I18n.t('assets.passwordError'))
            }
        }
        let messageId = ''
        switch (type) {
            case 'iota_sendTransaction':
            case 'send':
                {
                    let curToken = IotaSDK.curNode?.token
                    if (contract) {
                        curToken =
                            (IotaSDK.curNode.contractList || []).find((e) => e.contract === contract)?.token ||
                            IotaSDK.curNode?.token
                    }
                    let assets = assetsList.find((e) => e.name === curToken) || {}
                    let realBalance = BigNumber(assets.realBalance || 0)
                    const bigStatedAmount = BigNumber(statedAmount).times(IotaSDK.IOTA_MI)
                    realBalance = realBalance.minus(bigStatedAmount)
                    let residue = Number(realBalance.minus(amount)) || 0
                    const decimal = Math.pow(10, assets.decimal)
                    if (!IotaSDK.checkWeb3Node(curWallet.nodeId)) {
                        if (amount < decimal) {
                            return Toast.error(I18n.t('assets.sendBelow1Tips'))
                        }
                    }
                    if (residue < 0) {
                        return Toast.error(
                            I18n.t(statedAmount > 0 ? 'assets.balanceStakeError' : 'assets.balanceError')
                        )
                    }
                    if (!IotaSDK.checkWeb3Node(curWallet.nodeId)) {
                        if (residue < decimal && residue != 0) {
                            return Toast.error(I18n.t('assets.residueBelow1Tips'))
                        }
                    }
                    Toast.showLoading()
                    try {
                        const res = await IotaSDK.send({ ...curWallet, password }, address, amount, {
                            contract: assets?.contract,
                            token: assets?.name,
                            taggedData
                        })
                        if (!res) {
                            return
                        }
                        messageId = res.messageId

                        if (type === 'iota_sendTransaction') {
                            Bridge.sendMessage(type, res)
                        }

                        Toast.hideLoading()
                        Toast.success(
                            I18n.t(
                                IotaSDK.checkWeb3Node(curWallet.nodeId) ? 'assets.sendSucc' : 'assets.sendSuccRestake'
                            )
                        )
                        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
                        await sleep(2000)
                    } catch (error) {
                        if (type === 'iota_sendTransaction') {
                            Bridge.sendErrorMessage(type, error)
                        }
                        Toast.hideLoading()
                        setTimeout(() => {
                            Toast.error(
                                `${String(error)}---amount:${amount}---residue:${residue}---realBalance:${Number(
                                    realBalance
                                )}---bigStatedAmount:${bigStatedAmount}`,
                                {
                                    duration: 5000
                                }
                            )
                        }, 500)
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
                    await Bridge.iota_getPublicKey(origin, expires, isKeepPopup)
                }
                break
            case 'iota_changeAccount':
                {
                    await Bridge.sendMessage(type, {
                        code: 200,
                        address: curWallet.address,
                        nodeId: curWallet.nodeId,
                        network: IotaSDK.nodes.find((e) => e.id === curWallet.nodeId)?.network
                    })
                    Toast.hideLoading()
                }
                break
            case 'iota_connect':
                {
                    await Bridge.iota_connect(origin, expires, isKeepPopup)
                }
                break
            case 'iota_sign':
                {
                    await Bridge.iota_sign(origin, expires, content, isKeepPopup, password)
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
        if (!isKeepPopup) {
            closeWindow()
        }
    }
    const checkDeepLink = (url) => {
        return /^tanglepay:\/\/.+/.test(url)
    }
    const handleUrl = async (url) => {
        if (!url) return
        if (!checkDeepLink(url)) {
            return
        }
        const res = Base.handlerParams(url)
        const regex = /(<([^>]+)>)/gi
        for (const i in res) {
            res[i] = (res[i] || '').replace(/#\/.+/, '').replace(regex, '')
        }
        let {
            network,
            value,
            unit,
            return_url,
            item_desc = '',
            merchant = '',
            content = '',
            origin = '',
            isKeepPopup,
            expires,
            taggedData = ''
        } = res
        let toNetId
        if (network) {
            await IotaSDK.getNodes()
            toNetId = IotaSDK.nodes.find((e) => e.network === network)?.id
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
            setDeepLink('')
            clearTimeout(selectTimeHandler.current)
            const path = url.replace('tanglepay://', '').split('?')[0]
            setInit(true)
            if (path) {
                let [type, address] = path.split('/')
                switch (type) {
                    case 'iota_sendTransaction': //sdk send
                    case 'send':
                        {
                            value = parseFloat(value) || 0
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
                            if (IotaSDK.checkWeb3Node(toNetId || curNodeId)) {
                                let curToken = IotaSDK.curNode?.token
                                if (taggedData) {
                                    contract = address
                                    unit = 'wei'
                                    value = `0x${taggedData.slice(-64).replace(/^0+/, '')}`
                                    value = parseFloat(IotaSDK.client?.utils.hexToNumberString(value)) || 0
                                    address = `0x${taggedData.slice(-(64 + 40), -64)}`
                                    curToken =
                                        (IotaSDK.curNode.contractList || []).find((e) => e.contract === contract)
                                            ?.token || IotaSDK.curNode?.token
                                }
                                unit = unit || 'wei'
                                if (IotaSDK.client?.utils) {
                                    sendAmount = IotaSDK.client.utils.toWei(String(value), unit)
                                    showValue = IotaSDK.client.utils.fromWei(String(sendAmount), 'ether')
                                    showUnit = curToken
                                } else {
                                    showValue = value
                                    showUnit = unit
                                    sendAmount = value
                                }
                            } else {
                                unit = unit || 'Mi'
                                showValue = IotaSDK.convertUnits(value, unit, 'Mi')
                                sendAmount = IotaSDK.convertUnits(value, unit, 'i')
                                showUnit = 'MIOTA'
                            }

                            let str = I18n.t('apps.send')
                            let fromStr = I18n.t('apps.sendFrom')
                            let forStr = I18n.t('apps.sendFor')
                            str = str.replace('#merchant#', merchant ? fromStr + merchant : '')
                            str = str.replace('#item_desc#', item_desc ? forStr + item_desc : '')
                            str = str.trim().replace('#address#', address)
                            str = str
                                .replace('#amount#', '<span class="fw600">' + showValue + '</span>')
                                .replace('#unit#', showUnit)
                                .replace(/\n/g, '<br/>')
                            setDappData({
                                texts: [{ text: str }],
                                return_url,
                                type,
                                amount: sendAmount,
                                address,
                                taggedData,
                                contract
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
                                content
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
                            onExecute({ type })
                        }
                        break
                    case 'iota_changeAccount': {
                        //sdk change account
                        Toast.showLoading()
                        onExecute({ type })
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
                                isKeepPopup: isKeepPopup == 1,
                                expires
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
                                isKeepPopup: isKeepPopup == 1,
                                expires
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
        handleUrl(deepLink)
    }, [JSON.stringify(curWallet), deepLink, curNodeId])
    useEffect(() => {
        if (dappData.type === 'iota_sendTransaction' || dappData.type === 'send') {
            isRequestAssets && isRequestHis ? Toast.hideLoading() : Toast.showLoading()
        }
    }, [dappData.type, isRequestAssets, isRequestHis])
    useEffect(() => {
        const params = Base.handlerParams(window.location.search)
        const url = params.url
        if (checkDeepLink(url)) {
            setInit(false)
            show()
            setDeepLink(url)
        }
        setContenth(document.getElementById('app').offsetHeight)
    }, [])
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
                        {dappData.type !== 'iota_connect' && (
                            <Form.Item>
                                <Input
                                    type='password'
                                    onChange={setPassword}
                                    placeholder={I18n.t('assets.passwordTips')}
                                />
                            </Form.Item>
                        )}
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
                                    closeWindow()
                                }}
                                style={{ '--border-radius': '30px' }}
                                color='default'
                                size='small'>
                                {I18n.t('apps.cancel')}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Mask>
    )
}
