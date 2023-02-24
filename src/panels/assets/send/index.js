import React, { useState, useRef, useEffect } from 'react'
import { Form, Input, Button, TextArea } from 'antd-mobile'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useStore } from '@tangle-pay/store'
import { useGetNodeWallet } from '@tangle-pay/store/common'
import { Nav, Toast } from '@/common'
import BigNumber from 'bignumber.js'
import { useLocation } from 'react-router-dom'
import { useGetParticipationEvents } from '@tangle-pay/store/staking'
import { GasDialog } from '@/common/components/gasDialog'
// import { SendFailDialog } from '@/common/components/sendFailDialog'

const schema = Yup.object().shape({
    // currency: Yup.string().required(),
    receiver: Yup.string().required(),
    amount: Yup.number().positive().required(),
    password: Yup.string().required()
})
export const AssetsSend = () => {
    const gasDialog = useRef()
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
    currency = currency || assetsList[0]?.name
    const form = useRef()
    const [curWallet] = useGetNodeWallet()
    let assets = assetsList.find((e) => e.name === currency) || {}
    if (assetsId) {
        assets = assetsList.find((e) => e.tokenId === assetsId || e.contract === assetsId) || {}
    }
    // const bigStatedAmount = BigNumber(statedAmount).times(IotaSDK.IOTA_MI)
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
    useEffect(() => {
        if (IotaSDK.checkWeb3Node(curWallet.nodeId)) {
            const eth = IotaSDK.client.eth
            Promise.all([eth.getGasPrice(), IotaSDK.getDefaultGasLimit(curWallet.address, assets?.contract)]).then(
                ([gasPrice, gas]) => {
                    let gasLimit = gasInfo.gasLimit || gas
                    let totalWei = new BigNumber(gasPrice).times(gasLimit)
                    const totalEth = IotaSDK.client.utils.fromWei(totalWei.valueOf(), 'ether')
                    const gasPriceWei = gasPrice
                    gasPrice = IotaSDK.client.utils.fromWei(gasPrice, 'gwei')
                    const total = IotaSDK.client.utils.fromWei(totalWei.valueOf(), 'gwei')
                    setGasInfo({
                        gasLimit,
                        gasPrice,
                        gasPriceWei,
                        total,
                        totalEth
                    })
                }
            )
        }
    }, [curWallet.nodeId, assets?.contract])
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
                    validationSchema={schema}
                    onSubmit={async (values) => {
                        let { password, amount, receiver } = values
                        const isPassword = await IotaSDK.checkPassword(curWallet.seed, password)
                        if (!isPassword) {
                            return Toast.error(I18n.t('assets.passwordError'))
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
                                gas: gasInfo.gasLimit,
                                gasPrice: gasInfo.gasPriceWei
                            })
                            if (res) {
                                // Toast.hideLoading()
                                // Toast.success(I18n.t('assets.sendSucc'))
                                Base.goBack()
                            }
                        } catch (error) {
                            Toast.hideLoading()
                            // Toast.error(I18n.t('assets.sendError'))
                            console.log(error)
                            Toast.error(error.toString())
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
                                                    setFieldValue('amount', str)
                                                }}
                                            />
                                            <div className='fz16 cS'>
                                                {I18n.t('staking.available')} {Base.formatNum(available)} {assets.unit}
                                            </div>
                                        </div>
                                    </Form.Item>
                                ) : null}
                                {IotaSDK.checkWeb3Node(curWallet.nodeId) ? (
                                    <Form.Item noStyle>
                                        <div className='flex row ac jsb pv10 mt5'>
                                            <div className='fz18'>{I18n.t('assets.estimateGasFee')}</div>
                                            <div className='flex row ac'>
                                                <div
                                                    className='cS fz16 fw400 tr mr4 ellipsis'
                                                    style={{ maxWidth: 136 }}>
                                                    {gasInfo.totalEth}
                                                </div>
                                                {gasInfo.totalEth ? (
                                                    <div className='cS fz16 fw400 tr mr8'>{IotaSDK.curNode?.token}</div>
                                                ) : null}
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
                                <Form.Item className={`mt5 pl0 ${errors.password && 'form-error'}`}>
                                    <div className='fz18 mb10'>{I18n.t('assets.password')}</div>
                                    <Input
                                        type='password'
                                        className='pl0 pv4'
                                        placeholder={I18n.t('assets.passwordTips')}
                                        onChange={handleChange('password')}
                                        value={values.password}
                                    />
                                </Form.Item>
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
            {/* <SendFailDialog dialogRef={sendFailDialog} /> */}
        </div>
    )
}
