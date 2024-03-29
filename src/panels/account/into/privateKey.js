import React, { useRef, useEffect, useState } from 'react'
import { Form, Input, Button, TextArea } from 'antd-mobile'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { Formik } from 'formik'
import { useAddWallet } from '@tangle-pay/store/common'
import * as Yup from 'yup'
import { useCreateCheck } from '@tangle-pay/store/common'
import { Nav, SvgIcon, Toast } from '@/common'
import { context, setPin, markWalletPasswordEnabled, shouldShowSetPin, shouldShowSetPassword } from '@tangle-pay/domain'
import './index.less'
const schema = Yup.object().shape({
    privateKey: Yup.string().required(),
    name: Yup.string().required(),
    password: Yup.string().required(),
    rePassword: Yup.string().required(),
    agree: Yup.bool().isTrue().required()
})
const schemaNopassword = Yup.object().shape({
    privateKey: Yup.string().required(),
    name: Yup.string().required(),
    agree: Yup.bool().isTrue().required()
})
export const AccountIntoPrivateKey = () => {
    const form = useRef()
    const [shouldShowPassword, setShouldShowPassword] = useState(false)
    const [shouldShowPin, setShouldShowPin] = useState(false)
    useEffect(() => {
        setShouldShowPin(shouldShowSetPin())
        setShouldShowPassword(shouldShowSetPassword())
    }, [])
    useCreateCheck((name) => {
        form.current.setFieldValue('name', name)
    })
    const addWallet = useAddWallet()
    return (
        <div className='page into-page'>
            <Nav title={I18n.t('account.privateKeyImport')} />
            <div className='page-content pb30'>
                <Formik
                    innerRef={form}
                    initialValues={{
                        agree: true
                    }}
                    validateOnBlur={false}
                    validateOnChange={false}
                    validateOnMount={false}
                    validationSchema={shouldShowPin || shouldShowPassword ? schema : schemaNopassword}
                    onSubmit={async (values) => {
                        const { password, rePassword } = values
                        if (shouldShowPassword) {
                            if (!Base.checkPassword(password)) {
                                return Toast.error(I18n.t('account.intoPasswordTips'))
                            }
                            if (password !== rePassword) {
                                return Toast.error(I18n.t('account.checkPasswrod'))
                            }
                        } else if (shouldShowPin) {
                            if (!Base.checkPin(password)) {
                                return Toast.error(I18n.t('account.intoPinTips'))
                            }
                            if (password !== rePassword) {
                                return Toast.error(I18n.t('account.checkPin'))
                            }
                            await setPin(password)
                        } else {
                            values.password = context.state.pin
                            values.rePassword = context.state.pin
                        }
                        const res = await IotaSDK.importPrivateKey({
                            ...values
                        })
                        if (shouldShowPassword) {
							await markWalletPasswordEnabled(res.id);
						}
                        addWallet({
                            ...res
                        })
                        Base.replace('/main')
                    }}>
                    {({ handleChange, handleSubmit, setFieldValue, values, errors }) => (
                        <div className='p16 pt12 flex column jsb'>
                            <Form>
                                <div>
                                    <div>
                                        <div className='fz16 cS'>{I18n.t('account.inputPrivateKey')}</div>
                                    </div>
                                    <div
                                        className={`border radius10 mt10 flex c column ${
                                            !errors.privateKey ? 'border-color-b' : 'border-color-r'
                                        }`}>
                                        <TextArea
                                            rows={4}
                                            className='p10'
                                            onChange={handleChange('privateKey')}
                                            value={values.privateKey}
                                        />
                                    </div>
                                </div>
                                <Form.Item className={`mt10 pl0 ${errors.name && 'form-error'}`}>
                                    <div className='fz16 mb10'>{I18n.t('account.intoName')}</div>
                                    <Input
                                        style={{ paddingTop: 3, paddingBottom: 3 }}
                                        placeholder={I18n.t('account.intoNameTips')}
                                        onChange={handleChange('name')}
                                        value={values.name}
                                    />
                                </Form.Item>
                                {shouldShowPassword && (
                                <Form.Item className={`mt16 pl0 ${errors.password && 'form-error'}`}>
                                    <div className='fz16 mb10'>{I18n.t('account.intoPassword')}</div>
                                    <Input
                                        style={{ paddingTop: 3, paddingBottom: 3 }}
                                        type='password'
                                        placeholder={I18n.t('account.intoPasswordTips')}
                                        onChange={handleChange('password')}
                                        value={values.password}
                                        maxLength={20}
                                    />
                                </Form.Item>
                                )}
                                {shouldShowPassword && (
                                <Form.Item className={`pl0 mb5 ${errors.rePassword && 'form-error'}`}>
                                    <Input
                                        className='pv4'
                                        type='password'
                                        placeholder={I18n.t('account.intoRePasswordTips')}
                                        onChange={handleChange('rePassword')}
                                        value={values.rePassword}
                                        maxLength={20}
                                    />
                                </Form.Item>
                                )}
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
                            </Form>
                            <div
                                className='flex row as pl0 mt30 mb20'
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
                            <Button size='large' color='primary' block onClick={handleSubmit}>
                                {I18n.t('account.intoBtn')}
                            </Button>
                        </div>
                    )}
                </Formik>
            </div>
        </div>
    )
}
