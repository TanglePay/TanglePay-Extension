import React, { useState, useRef } from 'react'
import { Form, Input, Button, TextArea } from 'antd-mobile'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useStore } from '@tangle-pay/store'
import { useGetNodeWallet } from '@tangle-pay/store/common'
import { Nav, Toast } from '@/common'
import BigNumber from 'bignumber.js'
import { useLocation } from 'react-router-dom'

const schema = Yup.object().shape({
    // currency: Yup.string().required(),
    receiver: Yup.string().required(),
    amount: Yup.number().positive().required(),
    password: Yup.string().required()
})
export const AssetsSend = () => {
    const [statedAmount] = useStore('staking.statedAmount')
    const [assetsList] = useStore('common.assetsList')
    let params = useLocation()
    params = Base.handlerParams(params.search)
    let currency = params?.currency
    currency = currency || assetsList[0].name
    const form = useRef()
    const [curWallet] = useGetNodeWallet()
    const assets = assetsList.find((e) => e.name === currency) || {}
    const bigStatedAmount = BigNumber(statedAmount).times(IotaSDK.IOTA_MI)
    let realBalance = BigNumber(assets.realBalance || 0).minus(bigStatedAmount)
    if (Number(realBalance) < 0) {
        realBalance = BigNumber(0)
    }
    let available = Base.formatNum(realBalance.div(Math.pow(10, assets.decimal)))
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
                        if (password !== curWallet.password) {
                            return Toast.error(I18n.t('assets.passwordError'))
                        }
                        amount = parseFloat(amount) || 0
                        const decimal = Math.pow(10, assets.decimal)
                        let sendAmount = Number(BigNumber(amount).times(decimal))
                        let residue = Number(realBalance.minus(sendAmount)) || 0
                        if (!IotaSDK.checkWeb3Node(curWallet.nodeId)) {
                            if (sendAmount < decimal) {
                                return Toast.error(I18n.t('assets.sendBelow1Tips'))
                            }
                        }
                        if (residue < 0) {
                            return Toast.error(
                                I18n.t(statedAmount > 0 ? 'assets.balanceStakeError' : 'assets.balanceError')
                            )
                        }
                        if (!IotaSDK.checkWeb3Node(curWallet.nodeId)) {
                            if (residue < Number(BigNumber(0.01).times(decimal))) {
                                sendAmount = Number(realBalance)
                            } else if (residue < decimal && residue != 0) {
                                return Toast.error(I18n.t('assets.residueBelow1Tips'))
                            }
                        }
                        Toast.showLoading()
                        try {
                            const res = await IotaSDK.send(curWallet, receiver, sendAmount, {
                                contract: assets?.contract,
                                token: assets?.name
                            })
                            if (res) {
                                Toast.hideLoading()
                                Toast.success(I18n.t('assets.sendSucc'))
                                Base.goBack()
                            }
                        } catch (error) {
                            Toast.hideLoading()
                            // Toast.error(I18n.t('assets.sendError'))
                            console.log(error)
                            Toast.error(
                                `${error.toString()}---input:${
                                    values.amount
                                }---amount:${amount}---sendAmount:${sendAmount}---residue:${residue}---realBalance:${Number(
                                    realBalance
                                )}---available:${available}---bigStatedAmount:${bigStatedAmount}`,
                                {
                                    duration: 5000
                                }
                            )
                        }
                    }}>
                    {({ handleChange, handleSubmit, setFieldValue, values, errors }) => (
                        <div className='ph50 pt30'>
                            <Form>
                                <Form.Item className='pl0'>
                                    <div className='flex row ac jsb'>
                                        <div className='fz16'>{I18n.t('assets.currency')}</div>
                                        <div className='flex row ac'>
                                            <div className='fz14 cS'>{currency}</div>
                                        </div>
                                    </div>
                                </Form.Item>
                                <Form.Item className={`mt5 pl0 ${errors.receiver && 'form-error'}`}>
                                    <div className='fz16 mb10'>{I18n.t('assets.receiver')}</div>
                                    <TextArea
                                        autoSize={{ minRows: 1, maxRows: 2 }}
                                        className='fz14 pl0 pb0'
                                        placeholder={I18n.t('assets.receiverTips')}
                                        onChange={handleChange('receiver')}
                                        value={values.receiver}
                                    />
                                </Form.Item>
                                <Form.Item className={`mt5 pl0 ${errors.amount && 'form-error'}`}>
                                    <div className='fz16 mb10'>{I18n.t('assets.amount')}</div>
                                    <div className='flex ac jsb'>
                                        <Input
                                            type='number'
                                            className='pl0 flex1'
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
                                        <div className='fz14 cS'>
                                            {I18n.t('assets.balance')} {Base.formatNum(available)} {assets.unit}
                                        </div>
                                    </div>
                                </Form.Item>
                                <Form.Item className={`mt5 pl0 ${errors.password && 'form-error'}`}>
                                    <div className='fz16 mb10'>{I18n.t('assets.password')}</div>
                                    <Input
                                        type='password'
                                        className='pl0'
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
        </div>
    )
}
