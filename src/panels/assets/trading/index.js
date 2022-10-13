import React, { useState, useRef, useEffect } from 'react'
import { Nav, SvgIcon, Toast } from '@/common'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import { Form, Input, Button } from 'antd-mobile'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useGetNodeWallet, useHandleUnlocalConditions } from '@tangle-pay/store/common'
import { useLocation } from 'react-router-dom'

const schema = Yup.object().shape({
    password: Yup.string().required()
})

export const AssetsTrading = () => {
    const form = useRef()
    const [curWallet] = useGetNodeWallet()
    let params = useLocation()
    params = Base.handlerParams(params.search)
    const id = params.id
    const [unlockConditions] = useStore('common.unlockConditions')
    const curInfo = unlockConditions.find((e) => e.blockId == id) || {}
    return (
        <div className='page assets-trading'>
            <Nav title={I18n.t('assets.tradingTitle')} />
            <div className='ph16 pt16'>
                <div className='fz18 mb20 fw600'>Accept The Transaction</div>
                <div className='flex ac border-b pb20'>
                    <div className='flex c pr'>
                        <img
                            className='border pa bgW'
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 32,
                                left: 0,
                                opacity: 1,
                                top: 0,
                                zIndex: 0
                            }}
                            src={Base.getIcon('SMR')}
                            alt=''
                            onError={(e) => {
                                e.target.style.opacity = 0
                            }}
                        />
                        <div
                            className='border bgP flex c cW fw600 fz24'
                            style={{ width: 32, height: 32, borderRadius: 32 }}>
                            {String('SMR').toLocaleUpperCase()[0]}
                        </div>
                    </div>
                    <div className='cP fz16 fw600 ml20 mr24'>
                        {/* {item.token}: {item.amountStr} */}
                        SMR: 254
                    </div>
                    <div className='fz16 fw400 ellipsis'>From {Base.handleAddress(curInfo.unlockAddress)}</div>
                </div>
                <div className='pt16'>
                    <div className='flex ac jsb pb10'>
                        <div className='fz16 fw400'>Storage Deposit</div>
                        <div className='fz16 fw400'>0.05</div>
                    </div>
                    <div className='flex ac jsb pb10'>
                        <div className='fz16 fw400'>SMR</div>
                    </div>
                    <div className='flex ac jsb pb10'>
                        <div className='fz16 fw400'>Standard</div>
                        <div className='fz16 fw400'>IRC30</div>
                    </div>
                </div>
                <div className='pt10'>
                    <div className='pb10'>
                        <div className='fz16 fw400'>Token ID</div>
                    </div>
                    <div className='pb10'>
                        <div className='fz16 fw400' style={{ wordBreak: 'break-all' }}>
                            0x0877afeijkcjick6ie74islflij08kcl2iwld06ek0lmc123if0100000000
                        </div>
                    </div>
                </div>
                <div className='mt10'>
                    <Formik
                        innerRef={form}
                        initialValues={{}}
                        validateOnBlur={false}
                        validateOnChange={false}
                        validateOnMount={false}
                        validationSchema={schema}
                        onSubmit={async (values) => {
                            const { password } = values
                            if (!Base.checkPassword(password)) {
                                return Toast.error(I18n.t('account.intoPasswordTips'))
                            }
                            console.log(password)
                        }}>
                        {({ handleChange, handleSubmit, values, errors }) => (
                            <div>
                                <Form>
                                    <Form.Item className={`mb16 pl0 border-b ${errors.password && 'form-error'}`}>
                                        <div className='fz16 mb16'>
                                            {I18n.t('account.showKeyInputPassword').replace(/{name}/, curWallet.name)}
                                        </div>
                                        <Input
                                            className='fz16'
                                            type='password'
                                            placeholder={I18n.t('account.intoPasswordTips')}
                                            onChange={handleChange('password')}
                                            value={values.password}
                                            maxLength={20}
                                        />
                                    </Form.Item>
                                </Form>
                                <div className='flex row ac jsb' style={{ marginTop: 50 }}>
                                    <Button onClick={handleSubmit} disabled={!values.password} color='primary' block>
                                        {I18n.t('shimmer.accept')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    )
}
