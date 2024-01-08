import React, { useState, useRef, useEffect } from 'react'
import { Form, Input, Button, TextArea } from 'antd-mobile'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useStore } from '@tangle-pay/store'
import { useGetNodeWallet, useGetAssetsList } from '@tangle-pay/store/common'
import { Nav, Toast, ConfirmDialog } from '@/common'
import BigNumber from 'bignumber.js'
import { useLocation } from 'react-router-dom'
import { useGetParticipationEvents } from '@tangle-pay/store/staking'
import { GasDialog } from '@/common/components/gasDialog'
import { context, checkWalletIsPasswordEnabled } from '@tangle-pay/domain'
// import { SendFailDialog } from '@/common/components/sendFailDialog'

const schema = Yup.object().shape({
    receiver: Yup.string().required(),
    amount: Yup.number().positive().required(),
    password: Yup.string().required()
})
const schemaNopassword = Yup.object().shape({
    receiver: Yup.string().required(),
    amount: Yup.number().positive().required()
})
export const AssetsSend = () => {
    const gasDialog = useRef()
    const confirmDialog = useRef()
    const [waitPs, setWaitPs] = useState()
    // const sendFailDialog = useRef()
    // const timeHandler = useRef()
    // const [statedAmount] = useStore('staking.statedAmount')

    useGetParticipationEvents()
    const [assetsList] = useStore('common.assetsList')
    let params = useLocation()
    params = Base.handlerParams(params.search)
    const assetsId = params?.id
    let currency = params?.currency
    const nftId = params?.nftId
    const nftImg = params?.nftImg
    const collectionId = params.collectionId
    currency = currency || assetsList[0]?.name
    const form = useRef()
    const [receiver, setReceiver] = useState('')
    const [inputAmount, setInputAmount] = useState('')
    const [curWallet] = useGetNodeWallet()
    let assets = assetsList.find((e) => e.name === currency) || {}
    if (assetsId) {
        assets = assetsList.find((e) => e.tokenId === assetsId || e.contract === assetsId) || {}
    }
    // const bigStatedAmount = BigNumber(statedAmount).times(IotaSDK.IOTA_MI)
    // log assets
    console.log('AssetsSend', assets)
    // let realBalance = BigNumber(assets.realBalance || 0).minus(bigStatedAmount)
    let realBalance = BigNumber(assets.realBalance || 0)
    if (IotaSDK.checkSMR(curWallet.nodeId) && !assets.isSMRToken) {
        realBalance = BigNumber(assets.realAvailable || 0)
    }
    if (Number(realBalance) < 0) {
        realBalance = BigNumber(0)
    }
    let available = Base.formatNum(IotaSDK.getNumberStr(Number(realBalance.div(Math.pow(10, assets.decimal)))))
    // useEffect(() => {
    //     return () => {
    //         clearTimeout(timeHandler.current)
    //     }
    // }, [])
    const [gasInfo, setGasInfo] = useState({})
    const [isWalletPassowrdEnabled, setIsWalletPassowrdEnabled] = useState(false)
    useEffect(() => {
        checkWalletIsPasswordEnabled(curWallet.id).then((res) => {
            console.log('isWalletPassowrdEnabled', res)
            setIsWalletPassowrdEnabled(res)
        })
    }, [])
    useEffect(() => {
        if (IotaSDK.checkWeb3Node(curWallet.nodeId) && !!receiver) {
            const amount = parseFloat(inputAmount) || 0
            let decimal = Math.pow(10, assets.decimal)
            let sendAmount = Number(BigNumber(amount).times(decimal))
            sendAmount = IotaSDK.getNumberStr(sendAmount || 0)
            const eth = IotaSDK.client.eth
            console.log(sendAmount)
            Promise.all([eth.getGasPrice(), IotaSDK.getDefaultGasLimit(curWallet.address, assets?.contract, sendAmount, undefined, receiver)]).then(([gasPrice, gas]) => {
                if (assets?.contract) {
                    if (IotaSDK.curNode?.contractGasPriceRate) {
                        gasPrice = IotaSDK.getNumberStr(parseInt(gasPrice * IotaSDK.curNode?.contractGasPriceRate))
                    }
                    if (IotaSDK.curNode?.contractGasLimitRate) {
                        gas = IotaSDK.getNumberStr(parseInt(gas * IotaSDK.curNode?.contractGasLimitRate))
                    }
                } else {
                    if (IotaSDK.curNode?.gasPriceRate) {
                        gasPrice = IotaSDK.getNumberStr(parseInt(gasPrice * IotaSDK.curNode?.gasPriceRate))
                    }
                    if (IotaSDK.curNode?.gasLimitRate) {
                        gas = IotaSDK.getNumberStr(parseInt(gas * IotaSDK.curNode?.gasLimitRate))
                    }
                }
                // let gasLimit = gasInfo.gasLimit || gas
                let gasLimit = gas
                let totalWei = new BigNumber(gasPrice).times(gasLimit)
                totalWei = IotaSDK.getNumberStr(totalWei.valueOf())
                const totalEth = IotaSDK.client.utils.fromWei(totalWei, 'ether')
                const gasPriceWei = gasPrice
                gasPrice = IotaSDK.client.utils.fromWei(gasPrice, 'gwei')
                const total = IotaSDK.client.utils.fromWei(totalWei, 'gwei')
                setGasInfo({
                    gasLimit,
                    gasPrice,
                    gasPriceWei,
                    total,
                    totalEth
                })
            })
        }
    }, [curWallet.nodeId, assets?.contract, receiver, inputAmount, assets.decimal])
    useGetAssetsList(curWallet)
    const isLedger = curWallet.type == 'ledger'

    return (
        <div className='page'>
            <Nav title={I18n.t('assets.send')} />
            <div>
                <Formik
                    innerRef={form}
                    initialValues={nftId ? { amount: '1' } : {}}
                    validateOnBlur={false}
                    validateOnChange={false}
                    validateOnMount={false}
                    validationSchema={isLedger || !isWalletPassowrdEnabled ? schemaNopassword : schema}
                    onSubmit={async (values) => {
                        let { password, amount, receiver } = values
                        amount = inputAmount || amount
                        if (!isWalletPassowrdEnabled) {
                            password = context.state.pin
                        }
                        if (!isLedger) {
                            const isPassword = await IotaSDK.checkPassword(curWallet.seed, password)
                            if (!isPassword) {
                                return Toast.error(I18n.t('assets.passwordError'))
                            }
                        }
                        if (!isWalletPassowrdEnabled) {
                            const wait = new Promise((resolve, reject) => {
                                setWaitPs({ resolve, reject })
                            })
                            confirmDialog.current.show(receiver)
                            console.log(waitPs)
                            try {
                                await wait
                            } catch (error) {
                                return
                                // return Toast.error(I18n.t('assets.cancelSend'))
                            }
                        }
                        amount = parseFloat(amount) || 0
                        let decimal = Math.pow(10, assets.decimal)
                        let sendAmount = Number(BigNumber(amount).times(decimal))
                        let residue = Number(realBalance.minus(sendAmount)) || 0
                        if (!IotaSDK.checkWeb3Node(curWallet.nodeId) && !IotaSDK.checkSMR(curWallet.nodeId)) {
                            if (sendAmount < decimal) {
                                return Toast.error(I18n.t('assets.sendBelow1Tips'))
                            }
                        }
                        if (residue < 0) {
                            return Toast.error(I18n.t('assets.balanceError'))
                        }
                        if (!IotaSDK.checkWeb3Node(curWallet.nodeId) && !IotaSDK.checkSMR(curWallet.nodeId)) {
                            if (residue < Number(BigNumber(0.01).times(decimal))) {
                                sendAmount = Number(realBalance)
                            } else if (residue < decimal && residue != 0) {
                                return Toast.error(I18n.t('assets.residueBelow1Tips'))
                            }
                        }
                        // confirm box

                        Toast.showLoading()
                        const tokenId = assets?.tokenId
                        try {
                            let mainBalance = 0
                            if (tokenId) {
                                mainBalance = assetsList.find((e) => e.name === IotaSDK.curNode?.token)?.realBalance
                            }
                            // nft
                            if (nftId) {
                                amount = 1
                                sendAmount = 1
                                residue = 0
                                realBalance = 0
                                decimal = 0
                            }
                            const res = await IotaSDK.send({ ...curWallet, password }, receiver, sendAmount, {
                                contract: assets?.contract,
                                token: assets?.name,
                                residue,
                                realBalance: Number(realBalance),
                                awaitStake: true,
                                tokenId,
                                decimal: assets?.decimal,
                                mainBalance,
                                nftId,
                                collectionId,
                                gas: gasInfo.gasLimit,
                                gasPrice: gasInfo.gasPriceWei
                            })
                            if (res) {
                                // Toast.hideLoading()
                                // Toast.success(I18n.t('assets.sendSucc'))
                                if (isLedger) {
                                    Base.replace('/main')
                                } else {
                                    Base.goBack()
                                }
                            }
                        } catch (error) {
                            Toast.hideLoading()
                            // Toast.error(I18n.t('assets.sendError'))
                            console.log(error)
                            if (/Failed to fetch/i.test(error.toString())) {
                                setTimeout(() => {
                                    IotaSDK.refreshAssets()
                                }, 10000)
                                IotaSDK.refreshAssets()
                            } else {
                                Toast.error(error.toString())
                            }
                            // Toast.error(
                            //     `${error.toString()}---input:${
                            //         values.amount
                            //     }---amount:${amount}---sendAmount:${sendAmount}---residue:${residue}---realBalance:${Number(
                            //         realBalance
                            //     )}---available:${available}---`,
                            //     {
                            //         duration: 5000
                            //     }
                            // )
                        }
                    }}>
                    {({ handleChange, handleSubmit, setFieldValue, values, errors }) => (
                        <div className='p16'>
                            <Form>
                                <Form.Item className='pl0'>
                                    <div className='flex row ac jsb'>
                                        <div className='fz18 flex ac'>
                                            <span>{nftId ? 'NFT' : I18n.t('assets.currency')}</span>
                                            {nftId ? (
                                                <img
                                                    className='bgS ml12'
                                                    style={{
                                                        borderRadius: 4,
                                                        width: 30,
                                                        height: 30
                                                    }}
                                                    src={nftImg}
                                                />
                                            ) : null}
                                        </div>
                                        <div className='flex row ac'>
                                            <div style={{ maxWidth: 200 }} className='fz16 cS ellipsis'>
                                                {currency}
                                            </div>
                                        </div>
                                    </div>
                                </Form.Item>
                                <Form.Item className={`mt5 pl0 ${errors.receiver && 'form-error'}`}>
                                    <div className='fz18 mb10'>{I18n.t('assets.receiver')}</div>
                                    <TextArea
                                        autoSize={{ minRows: 1, maxRows: 2 }}
                                        className='fz16 pl0 pb0'
                                        placeholder={I18n.t('assets.receiverTips')}
                                        onChange={handleChange('receiver')}
                                        value={values.receiver}
                                        onBlur={() => {
                                            setReceiver(values.receiver)
                                        }}
                                    />
                                </Form.Item>
                                {!nftId ? (
                                    <Form.Item className={`mt5 pl0 ${errors.amount && 'form-error'}`}>
                                        <div className='fz18 mb10'>{I18n.t('assets.amount')}</div>
                                        <div className='flex ac jsb'>
                                            <Input
                                                type='number'
                                                className='pl0 flex1 pv4'
                                                placeholder={I18n.t('assets.amountTips')}
                                                onChange={handleChange('amount')}
                                                value={values.amount}
                                                onBlur={() => {
                                                    let precision = assets.decimal
                                                    if (precision > 6) {
                                                        precision = 6
                                                    }
                                                    let str = Base.formatNum(values.amount, precision)
                                                    if (parseFloat(str) < Math.pow(10, -precision)) {
                                                        str = String(Math.pow(10, -precision))
                                                    }
                                                    // We format, but not show on the page
                                                    // setFieldValue('amount', str)
                                                    setInputAmount(str)
                                                }}
                                            />
                                            <div className='fz16 cS'>
                                                {I18n.t('staking.available')} {Base.formatNum(available,6)} {assets.unit}
                                            </div>
                                        </div>
                                    </Form.Item>
                                ) : null}
                                {IotaSDK.checkWeb3Node(curWallet.nodeId) ? (
                                    <Form.Item noStyle>
                                        <div className='flex row ac jsb pv10 mt5'>
                                            <div className='fz18'>{I18n.t('assets.estimateGasFee')}</div>
                                            <div className='flex row ac'>
                                                <div className='cS fz16 fw400 tr mr4 ellipsis' style={{ maxWidth: 136 }}>
                                                    {gasInfo.totalEth}
                                                </div>
                                                {gasInfo.totalEth ? <div className='cS fz16 fw400 tr mr8'>{IotaSDK.curNode?.token}</div> : null}
                                                <div
                                                    className='press cP fz16 fw400'
                                                    onClick={() => {
                                                        if (JSON.stringify(gasInfo) == '{}') {
                                                            return
                                                        }
                                                        gasDialog.current.show({ ...gasInfo }, (res) => {
                                                            setGasInfo(res)
                                                        })
                                                    }}>
                                                    {I18n.t('assets.edit')}
                                                </div>
                                            </div>
                                        </div>
                                    </Form.Item>
                                ) : null}
                                {!isLedger && isWalletPassowrdEnabled ? (
                                    <Form.Item className={`mt5 pl0 ${errors.password && 'form-error'}`}>
                                        <div className='fz18 mb10'>{I18n.t('assets.password')}</div>
                                        <Input type='password' className='pl0 pv4' placeholder={I18n.t('assets.passwordTips')} onChange={handleChange('password')} value={values.password} />
                                    </Form.Item>
                                ) : null}
                                <div className='pb30' style={{ marginTop: 48 }}>
                                    <Button color='primary' size='large' block onClick={handleSubmit}>
                                        {I18n.t('assets.confirm')}
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    )}
                </Formik>
            </div>
            <GasDialog dialogRef={gasDialog} />
            <ConfirmDialog dialogRef={confirmDialog} text={I18n.t('assets.sentTo')} promise={waitPs} />
            {/* <SendFailDialog dialogRef={sendFailDialog} /> */}
        </div>
    )
}
