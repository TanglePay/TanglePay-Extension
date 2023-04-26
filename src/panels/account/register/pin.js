import React, { useRef, useState, useEffect } from 'react'
import { Base, I18n } from '@tangle-pay/common'
import { Formik } from 'formik'
import { Form, Input, Button } from 'antd-mobile'
import * as Yup from 'yup'
import { context, setPin } from '@tangle-pay/domain'
import { useStore } from '@tangle-pay/store'
import { useCreateCheck } from '@tangle-pay/store/common'
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
export const AccountRegisterPin = () => {
    const [, setRegisterInfo] = useStore('common.registerInfo')
    const form = useRef()
    const [shouldShowPin, setShouldShowPin ] = useState( true )
    useCreateCheck((name) => {
        form.current.setFieldValue('name', name)
    })
    useEffect(() => {
        console.log(context)
        setShouldShowPin(context.state.walletCount == 0 || !context.state.isPinSet)
    }, [])
    return (
        <div className='page'>
            <Nav title={I18n.t('account.createTitle')} />
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
                        setRegisterInfo(Object.assign({},values,{ password:context.state.pin }))
                        Base.push('/account/backup')
                    }}>
                    {({ handleChange, handleSubmit, setFieldValue, values, errors }) => (
                        <div className='ph16 pt8'>
                            <Form>
                                <Form.Item className={`mt5 pl0 ${errors.name && 'form-error'}`}>
                                    <div className='fz18 mb10'>{I18n.t('account.intoName')}</div>
                                    <Input
                                        className='pt4'
                                        placeholder={I18n.t('account.intoNameTips')}
                                        onChange={handleChange('name')}
                                        value={values.name}
                                    />
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
                                    <SvgIcon
                                        size={15}
                                        className={`mr8 fz20 ${values.agree ? 'cP' : 'cB'}`}
                                        name={values.agree ? 'checkbox_1' : 'checkbox_0'}
                                    />
                                    <div
                                        className={`fz16 tl ${!errors.agree ? 'cB' : 'cR'}`}
                                        style={{ lineHeight: '22px' }}>
                                        {I18n.t('account.intoAgree')
                                            .split('##')
                                            .filter((e) => !!e)
                                            .map((e, i) => {
                                                return i % 2 ? (
                                                    <span
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            e.preventDefault()
                                                            Base.push(
                                                                i === 1
                                                                    ? 'https://tanglepay.com/terms.html'
                                                                    : 'https://tanglepay.com/policy.html'
                                                            )
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
                                        {I18n.t('account.createTitle')}
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
