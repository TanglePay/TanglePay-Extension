import React, { useState, useRef } from 'react'
import { Form, Input, Button, TextArea } from 'antd-mobile'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useStore } from '@tangle-pay/store'
import { useGetNodeWallet, useUpdateBalance } from '@tangle-pay/store/common'
import { Nav, Toast } from '@/common'
import BigNumber from 'bignumber.js'

const schema = Yup.object().shape({
    // currency: Yup.string().required(),
    receiver: Yup.string().required(),
    amount: Yup.number().positive().required(),
    password: Yup.string().required()
})
export const AssetsSend = () => {
    const [statedAmount] = useStore('staking.statedAmount')
    const updateBalance = useUpdateBalance()
    const [assetsList] = useStore('common.assetsList')
    const form = useRef()
    const [currency] = useState('IOTA')
    const [curWallet] = useGetNodeWallet()
    const assets = assetsList.find((e) => e.name === currency) || {}
    let available = parseFloat(assets.balance - statedAmount) || 0
    const realBalance = assets.realBalance
    if (available < 0) {
        available = 0
    }
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
                        const sendAmount = Number(BigNumber(amount).times(IotaSDK.IOTA_MI))
                        let residue = Number(BigNumber(realBalance).minus(sendAmount)) || 0
                        if (sendAmount < IotaSDK.IOTA_MI) {
                            return Toast.error(I18n.t('assets.sendBelow1Tips'))
                        }
                        if (residue < 0) {
                            return Toast.error(I18n.t('assets.balanceError'))
                        }
                        if (residue < IotaSDK.IOTA_MI && residue != 0) {
                            return Toast.error(I18n.t('assets.residueBelow1Tips'))
                        }
                        Toast.showLoading()
                        try {
                            await IotaSDK.send(curWallet, receiver, amount)
                            Toast.hideLoading()
                            Toast.success(I18n.t('assets.sendSucc'))
                            Base.goBack()
                            updateBalance((assets.balance - parseInt(amount)) * IotaSDK.IOTA_MI, curWallet.address)
                        } catch (error) {
                            console.log(error)
                            Toast.hideLoading()
                            Toast.error(I18n.t('assets.sendError'))
                        }
                    }}>
                    {({ handleChange, handleSubmit, setFieldValue, values, errors }) => (
                        <div className='ph50 pt30'>
                            <Form>
                                <Form.Item className='pl0'>
                                    <div className='flex row ac jsb'>
                                        <div className='fz16'>{I18n.t('assets.currency')}</div>
                                        <div className='flex row ac'>
                                            <div className='fz14 cS'>IOTA</div>
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
                                                setFieldValue('amount', (parseFloat(values.amount) || 0).toString())
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
