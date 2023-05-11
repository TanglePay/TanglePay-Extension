import React, { useRef, useState, useEffect } from 'react'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { Formik } from 'formik'
import { context, setPin, ensureInited } from '@tangle-pay/domain'
import { Form, Input, Button } from 'antd-mobile'
import * as Yup from 'yup'
import { useStore } from '@tangle-pay/store'
import { useCreateCheck, useAddWallet } from '@tangle-pay/store/common'
import { Nav, SvgIcon, Toast } from '@/common'
const getSchema = (shouldShowPin) => {
    if (shouldShowPin) {
        return Yup.object().shape({
            name: Yup.string().required(),
            password: Yup.string().required(),
            rePassword: Yup.string().required(),
            agree: Yup.bool().isTrue().required()
        })
    } else {
        return Yup.object().shape({
            name: Yup.string().required(),
            agree: Yup.bool().isTrue().required()
        })
    }
}
export const AccountHardwareInto = () => {
    const form = useRef()
    const [isLoading, setLoading] = useState(false)
    const addWallet = useAddWallet()
    const [shouldShowPin, setShouldShowPin] = useState(false)

    useEffect(() => {
        const fn = async () => {
            await ensureInited();
            console.log(context)
            setShouldShowPin(context.state.walletCount == 0 && !context.state.isPinSet)
        }
        fn()
    }, [])

    useCreateCheck((name) => {
        if (!IotaSDK.checkWeb3Node(IotaSDK.curNode?.id)) {
            form.current.setFieldValue('name', name)
        }
    })
    return (
        <div className='page'>
            <Nav title={I18n.t('account.connectLedger')} />
            <div>
                <Formik
                    innerRef={form}
                    initialValues={{
                        agree: true
                    }}
                    validateOnBlur={false}
                    validateOnChange={false}
                    validateOnMount={false}
                    validationSchema={getSchema(shouldShowPin)}
                    onSubmit={async (values) => {
                        try {
                            if (isLoading) {
                                return
                            }
                            const { password, rePassword } = values
                            if (shouldShowPin) {
                                if (!Base.checkPin(password)) {
                                    return Toast.error(I18n.t('account.intoPinTips'))
                                }
                                if (password !== rePassword) {
                                    return Toast.error(I18n.t('account.checkPin'))
                                }
                                await setPin(password)
                            }
                            setLoading(true)
                            const curNodeId = IotaSDK.curNode?.id
                            const isIota = IotaSDK.checkIota(curNodeId)
                            const isShimmer = IotaSDK.checkSMR(curNodeId)
                            if (isIota || isShimmer) {
                                Toast.showLoading()
                                const [{ address, path }] = await IotaSDK.getHardwareAddressInIota(curNodeId, 0, true, 1)
                                const info = await IotaSDK.importHardware({
                                    address: address,
                                    name: values.name,
                                    publicKey: '',
                                    path: path,
                                    type: 'ledger'
                                })
                                addWallet(info)
                                Toast.hideLoading()
                                Base.replace('/main')
                            } else if (IotaSDK.checkWeb3Node(curNodeId)) {
                                await IotaSDK.checkHardwareConnect()
                                Base.push('/account/hardware/import', {
                                    name: values.name,
                                    type: IotaSDK.curNode?.type
                                })
                            }
                            
                            setLoading(false)
                        } catch (error) {
                            setLoading(false)
                            Toast.show(String(error))
                        }
                    }}>
                    {({ handleChange, handleSubmit, setFieldValue, values, errors }) => (
                        <div className='ph16 pt8'>
                            <Form>
                                <Form.Item className={`mt5 pl0 ${errors.name && 'form-error'}`}>
                                    <div className='fz18 mb10'>{I18n.t('account.intoName')}</div>
                                    <Input className='pt4' placeholder={I18n.t('account.intoNameTips')} onChange={handleChange('name')} value={values.name} />
                                </Form.Item>
                                {shouldShowPin &&
                                (<Form.Item className={`mt10 pl0 ${errors.password && 'form-error'}`}>
                                    <div className='fz18 mb10'>{I18n.t('account.intoPin')}</div>
                                    <Input
                                        className='pt4'
                                        type='password'
                                        placeholder={I18n.t('account.intoPinTips')}
                                        onChange={handleChange('password')}
                                        value={values.password}
                                        maxLength={20}
                                    />
                                </Form.Item>)}
                                {shouldShowPin &&
                                (<Form.Item className={`pl0 ${errors.rePassword && 'form-error'}`}>
                                    <Input
                                        type='password'
                                        className='pt4'
                                        placeholder={I18n.t('account.intoRePin')}
                                        onChange={handleChange('rePassword')}
                                        value={values.rePassword}
                                        maxLength={20}
                                    />
                                </Form.Item>)}
                                <div
                                    className='flex row as pl0 mt20'
                                    onClick={() => {
                                        setFieldValue('agree', !values.agree)
                                    }}>
                                    <SvgIcon size={15} className={`mr8 fz20 ${values.agree ? 'cP' : 'cB'}`} name={values.agree ? 'checkbox_1' : 'checkbox_0'} />
                                    <div className={`fz16 tl ${!errors.agree ? 'cB' : 'cR'}`} style={{ lineHeight: '22px' }}>
                                        {I18n.t('account.intoAgree')
                                            .split('##')
                                            .filter((e) => !!e)
                                            .map((e, i) => {
                                                return i % 2 ? (
                                                    <span
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            e.preventDefault()
                                                            Base.push(i === 1 ? 'https://tanglepay.com/terms.html' : 'https://tanglepay.com/policy.html')
                                                        }}
                                                        key={i}
                                                        className='cP press'>
                                                        {e}
                                                    </span>
                                                ) : (
                                                    <span key={i}>{e}</span>
                                                )
                                            })}
                                    </div>
                                </div>
                                <div style={{ marginTop: 100 }}>
                                    <Button size='large' color='primary' block onClick={handleSubmit}>
                                        {I18n.t('account.connectLedger')}
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
