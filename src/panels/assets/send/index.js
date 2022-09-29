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
// import { SendFailDialog } from '@/common/components/sendFailDialog'

const schema = Yup.object().shape({
    // currency: Yup.string().required(),
    receiver: Yup.string().required(),
    amount: Yup.number().positive().required(),
    password: Yup.string().required()
})
export const AssetsSend = () => {
    // const sendFailDialog = useRef()
    // const timeHandler = useRef()
    // const [statedAmount] = useStore('staking.statedAmount')
    useGetParticipationEvents()
    const [assetsList] = useStore('common.assetsList')
    let params = useLocation()
    params = Base.handlerParams(params.search)
    let currency = params?.currency
    currency = currency || assetsList[0]?.name
    const form = useRef()
    const [curWallet] = useGetNodeWallet()
    const assets = assetsList.find((e) => e.name === currency) || {}
    // const bigStatedAmount = BigNumber(statedAmount).times(IotaSDK.IOTA_MI)
    // let realBalance = BigNumber(assets.realBalance || 0).minus(bigStatedAmount)
    let realBalance = BigNumber(assets.realAvailable || assets.realBalance || 0)
    if (Number(realBalance) < 0) {
        realBalance = BigNumber(0)
    }
    let available = Base.formatNum(realBalance.div(Math.pow(10, assets.decimal)))
    // useEffect(() => {
    //     return () => {
    //         clearTimeout(timeHandler.current)
    //     }
    // }, [])
    return (
        <div className='page'>
            <Nav title={I18n.t('assets.send')} />
            <div>
                <Formik
                    innerRef={form}
                    initialValues={{}}
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
                        const decimal = Math.pow(10, assets.decimal)
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
                            const res = await IotaSDK.send({ ...curWallet, password }, receiver, sendAmount, {
                                contract: assets?.contract,
                                token: assets?.name,
                                residue,
                                realBalance: Number(realBalance),
                                awaitStake: true,
                                tokenId,
                                decimal: assets?.decimal,
                                mainBalance
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
                                        <div className='fz18'>{I18n.t('assets.currency')}</div>
                                        <div className='flex row ac'>
                                            <div className='fz16 cS'>{currency}</div>
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
                                                if (IotaSDK.checkSMR(curWallet.nodeId)) {
                                                    str = String(parseInt(str))
                                                }
                                                setFieldValue('amount', str)
                                            }}
                                        />
                                        <div className='fz16 cS'>
                                            {I18n.t('staking.available')} {Base.formatNum(available)} {assets.unit}
                                        </div>
                                    </div>
                                </Form.Item>
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
                                <div className='pb30' style={{ marginTop: 100 }}>
                                    <Button color='primary' size='large' block onClick={handleSubmit}>
                                        {I18n.t('assets.confirm')}
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    )}
                </Formik>
            </div>
            {/* <SendFailDialog dialogRef={sendFailDialog} /> */}
        </div>
    )
}
