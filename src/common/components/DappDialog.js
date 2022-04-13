import React, { useState, useEffect, useRef } from 'react'
import { Button, Mask, Form, Input } from 'antd-mobile'
import { I18n, IotaSDK, Base } from '@tangle-pay/common'
import { useGetNodeWallet, useChangeNode, useUpdateBalance } from '@tangle-pay/store/common'
import { useStore } from '@tangle-pay/store'
import BigNumber from 'bignumber.js'
import { Toast } from './Toast'
import { Loading } from 'antd-mobile'

export const DappDialog = () => {
    const [isShow, setShow] = useState(false)
    const [init, setInit] = useState(false)
    const [contentH, setContenth] = useState(600)
    const [password, setPassword] = useState('')
    const [dappData, setDappData] = useState({
        texts: []
    })
    const [deepLink, setDeepLink] = useState('')
    const selectTimeHandler = useRef()
    const [curWallet] = useGetNodeWallet()
    const updateBalance = useUpdateBalance()
    const [assetsList] = useStore('common.assetsList')
    const assets = assetsList.find((e) => e.name === 'IOTA') || {}
    const [statedAmount] = useStore('staking.statedAmount')
    const [curNodeId, , dispatch] = useStore('common.curNodeId')
    const changeNode = useChangeNode(dispatch)
    const show = () => {
        requestAnimationFrame(() => {
            setShow(true)
        })
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
    const onExecute = async ({ address, return_url, content, type, amount }) => {
        if (password !== curWallet.password) {
            return Toast.error(I18n.t('assets.passwordError'))
        }
        let messageId = ''
        switch (type) {
            case 'send':
                {
                    let realBalance = BigNumber(assets.realBalance || 0)
                    const bigStatedAmount = BigNumber(statedAmount).times(IotaSDK.IOTA_MI)
                    realBalance = realBalance.minus(bigStatedAmount)
                    let residue = Number(realBalance.minus(amount)) || 0
                    try {
                        if (amount < IotaSDK.IOTA_MI) {
                            return Toast.error(I18n.t('assets.sendBelow1Tips'))
                        }
                        if (residue < 0) {
                            return Toast.error(I18n.t('assets.balanceError'))
                        }
                        if (residue < IotaSDK.IOTA_MI && residue != 0) {
                            return Toast.error(I18n.t('assets.residueBelow1Tips'))
                        }
                        Toast.showLoading()
                        const res = await IotaSDK.send(curWallet, address, amount)
                        messageId = res.messageId
                        Toast.hideLoading()
                        Toast.success(I18n.t('assets.sendSucc'))
                        updateBalance(residue, curWallet.address)
                    } catch (error) {
                        Toast.hideLoading()
                        Toast.error(
                            `${error.toString()}---amount:${amount}---residue:${residue}---realBalance:${Number(
                                realBalance
                            )}---bigStatedAmount:${bigStatedAmount}`
                        )
                    }
                }
                break
            case 'sign':
                try {
                    const residue = Number(assets.realBalance || 0)
                    if (residue < IotaSDK.IOTA_MI) {
                        return Toast.error(I18n.t('assets.balanceError'))
                    }
                    Toast.showLoading()
                    const res = await IotaSDK.sign(content, curWallet, residue)
                    messageId = res.messageId
                    Toast.hideLoading()
                } catch (error) {
                    Toast.hideLoading()
                    Toast.error(error.toString())
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
        closeWindow()
    }
    const checkDeepLink = (url) => {
        return /^tanglepay:\/\//.test(url)
    }
    const handleUrl = async (url, password) => {
        if (!url) return
        if (!checkDeepLink(url)) {
            return
        }
        const res = Base.handlerParams(url)
        for (const i in res) {
            res[i] = (res[i] || '').replace(/#\/.+/, '')
        }
        let { network, value, unit, return_url, item_desc = '', merchant = '', content = '' } = res
        unit = unit || 'i'
        const toNetId = IotaSDK.nodes.find((e) => e.apiPath === network)?.id
        if (toNetId && parseInt(toNetId) !== parseInt(curNodeId)) {
            await changeNode(toNetId)
            return
        } else if (!curWallet.address) {
            selectTimeHandler.current = setTimeout(() => {
                hide()
                Base.push('/assets/wallets')
            }, 500)
        } else {
            if (!password) {
                hide()
                return
            }
            setDeepLink('')
            clearTimeout(selectTimeHandler.current)
            const path = url.replace('tanglepay://', '').split('?')[0]
            setInit(true)
            if (path) {
                const [type, address] = path.split('/')
                switch (type) {
                    case 'send':
                        {
                            value = parseFloat(value) || 0
                            if (!value) {
                                Toast.error('Required: value')
                            }
                            if (!address) {
                                Toast.error('Required: address')
                            }
                            let str = I18n.t('apps.send')
                            let fromStr = I18n.t('apps.sendFrom')
                            let forStr = I18n.t('apps.sendFor')
                            str = str.replace('#merchant#', merchant ? fromStr + merchant : '')
                            str = str.replace('#item_desc#', item_desc ? forStr + item_desc : '')
                            str = str.trim().replace('#address#', address)
                            str = str
                                .replace(
                                    '#amount#',
                                    '<span class="fw600">' + IotaSDK.convertUnits(value, unit, 'Mi') + '</span>'
                                )
                                .replace(/\n/g, '<br/>')
                            setDappData({
                                texts: [{ text: str }],
                                return_url,
                                type,
                                amount: IotaSDK.convertUnits(value, unit, 'i'),
                                address
                            })
                            show()
                        }
                        break
                    case 'dapp':
                        break
                    case 'sign':
                        {
                            if (!content) {
                                Toast.error('Required: content')
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
                    default:
                        break
                }
            }
        }
    }
    useEffect(() => {
        handleUrl(deepLink, curWallet.password)
    }, [JSON.stringify(curWallet), deepLink])
    useEffect(() => {
        const params = Base.handlerParams(window.location.href)
        const url = params.url
        // const url =
        //     'tanglepay://send/atoi1qppxzslkz7le675wum03udualamx9e2mu5jz9y72ffsraranc7347vhsj2d?value=1&unit=Mi&merchant=TanglePay&item_desc=Cool NFT&return_url=https%3A%2F%2Ftanglepay.com&network=devnet'
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
                        <Form.Item>
                            <Input type='password' onChange={setPassword} placeholder={I18n.t('assets.passwordTips')} />
                        </Form.Item>
                        <div className='flex row jsb ac mt25'>
                            <Button
                                onClick={() => {
                                    onExecute(dappData)
                                }}
                                className='flex1 mr20'
                                style={{ '--border-radius': '30px' }}
                                color='primary'
                                size='small'>
                                {I18n.t('apps.execute')}
                            </Button>
                            <Button
                                className='flex1 bgS'
                                onClick={() => {
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
