import React, { useRef } from 'react'
import { Form, Input, Button, TextArea } from 'antd-mobile'
import { Base, I18n, Nav, images, IotaSDK, Toast } from '@tangle-pay/common'
import { Formik } from 'formik'
import { useAddWallet } from '@tangle-pay/store/common'
import * as Yup from 'yup'
import { useCreateCheck } from '@tangle-pay/store/common'
import { useLocation } from 'react-router-dom'
import './index.less'
const schema = Yup.object().shape({
    mnemonic: Yup.string().required(),
    name: Yup.string().required(),
    password: Yup.string().required(),
    rePassword: Yup.string().required(),
    agree: Yup.bool().isTrue().required()
})
export const AccountInto = () => {
    let params = useLocation()
    params = Base.handlerParams(params.search)
    const type = parseInt(params.type)
    const form = useRef()
    useCreateCheck((name) => {
        form.current.setFieldValue('name', name)
    })
    const addWallet = useAddWallet()
    return (
        <div className='page into-page'>
            <Nav title={I18n.t(type === 1 ? 'account.intoTitle1' : 'account.intoTitle2')} />
            <div className='page-content pb30'>
                <Formik
                    innerRef={form}
                    initialValues={{
                        agree: true
                    }}
                    validateOnBlur={false}
                    validateOnChange={false}
                    validateOnMount={false}
                    validationSchema={schema}
                    onSubmit={async (values) => {
                        //import mnenomics
                        if (type === 1) {
                            const { password, rePassword } = values
                            if (!Base.checkPassword(password)) {
                                return Toast.error(I18n.t('account.intoPasswordTips'))
                            }
                            if (password !== rePassword) {
                                return Toast.error(I18n.t('account.checkPasswrod'))
                            }
                            const res = await IotaSDK.importMnemonic({
                                ...values
                            })
                            addWallet({
                                ...res
                            })
                            Base.replace('/main')
                        }
                    }}>
                    {({ handleChange, handleSubmit, setFieldValue, values, errors }) => (
                        <div className='ph20 flex column jsb'>
                            <Form>
                                {type === 1 ? (
                                    <div>
                                        <div>
                                            <div className='fz14 pb10 tc cS'>{I18n.t('account.mnemonicTips')}</div>
                                        </div>
                                        <div
                                            className={`border radius10 mt10 flex c column ${
                                                !errors.mnemonic ? 'border-color-b' : 'border-color-r'
                                            }`}>
                                            <TextArea
                                                rows={4}
                                                className='p10'
                                                onChange={handleChange('mnemonic')}
                                                value={values.mnemonic}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={`border radius10 mt10 flex c column ${
                                            !errors.mnemonic ? 'border-color-b' : 'border-color-r'
                                        }`}
                                        style={{
                                            height: 100
                                        }}>
                                        <img
                                            className='mb20'
                                            style={{ width: 42, height: 49 }}
                                            src={images.com.file}
                                            alt=''
                                        />
                                        <div>{I18n.t('account.intoSelectFile')}</div>
                                    </div>
                                )}
                                <Form.Item className={`mt10 pl0 ${errors.name && 'form-error'}`}>
                                    <div className='fz14 mb10'>{I18n.t('account.intoName')}</div>
                                    <Input
                                        placeholder={I18n.t('account.intoNameTips')}
                                        onChange={handleChange('name')}
                                        value={values.name}
                                    />
                                </Form.Item>
                                <Form.Item className={`mt5 pl0 ${errors.password && 'form-error'}`}>
                                    <div className='fz14 mb10'>
                                        {I18n.t(type === 1 ? 'account.intoPassword' : 'account.intoFilePassword')}
                                    </div>
                                    <Input
                                        type='password'
                                        placeholder={I18n.t(
                                            type === 1 ? 'account.intoPasswordTips' : 'account.intoFilePasswordTips'
                                        )}
                                        onChange={handleChange('password')}
                                        value={values.password}
                                        maxLength={20}
                                    />
                                </Form.Item>
                                {type === 1 && (
                                    <Form.Item className={`pl0 mb5 ${errors.rePassword && 'form-error'}`}>
                                        <Input
                                            type='password'
                                            placeholder={I18n.t('account.intoRePasswordTips')}
                                            onChange={handleChange('rePassword')}
                                            value={values.rePassword}
                                        />
                                    </Form.Item>
                                )}
                            </Form>
                            <div
                                className='flex row as pl0 mt60 mb20'
                                onClick={() => {
                                    setFieldValue('agree', !values.agree)
                                }}>
                                <img
                                    className='mr10'
                                    style={{ widows: 15, height: 15, marginTop: 3 }}
                                    src={values.agree ? images.com.checkbox_1 : images.com.checkbox_0}
                                    alt=''
                                />
                                <div
                                    className={`fz14 tl ${!errors.agree ? 'cB' : 'cR'}`}
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
