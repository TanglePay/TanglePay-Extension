import React, { useRef } from 'react'
import { Base, I18n } from '@tangle-pay/common'
import { Formik } from 'formik'
import { Form, Input, Button } from 'antd-mobile'
import * as Yup from 'yup'
import { useStore } from '@tangle-pay/store'
import { useCreateCheck } from '@tangle-pay/store/common'
import { Nav, SvgIcon, Toast } from '@/common'

const schema = Yup.object().shape({
    name: Yup.string().required(),
    password: Yup.string().required(),
    rePassword: Yup.string().required(),
    agree: Yup.bool().isTrue().required()
})
export const AccountRegister = () => {
    const [, setRegisterInfo] = useStore('common.registerInfo')
    const form = useRef()
    useCreateCheck((name) => {
        form.current.setFieldValue('name', name)
    })
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
                    validationSchema={schema}
                    onSubmit={(values) => {
                        const { password, rePassword } = values
                        if (!Base.checkPassword(password)) {
                            return Toast.error(I18n.t('account.intoPasswordTips'))
                        }
                        if (password !== rePassword) {
                            return Toast.error(I18n.t('account.checkPasswrod'))
                        }
                        setRegisterInfo(values)
                        Base.push('/account/backup')
                    }}>
                    {({ handleChange, handleSubmit, setFieldValue, values, errors }) => (
                        <div className='ph16 pt8'>
                            <Form>
                                <Form.Item className={`mt5 pl0 ${errors.name && 'form-error'}`}>
                                    <div className='fz18 mb10'>{I18n.t('account.intoName')}</div>
                                    <Input
                                        className='pv4'
                                        placeholder={I18n.t('account.intoNameTips')}
                                        onChange={handleChange('name')}
                                        value={values.name}
                                    />
                                </Form.Item>
                                <Form.Item className={`mt10 pl0 ${errors.password && 'form-error'}`}>
                                    <div className='fz18 mb10'>{I18n.t('account.passwordOptional')}</div>
                                    <Input
                                        className='pv4'
                                        type='password'
                                        placeholder={I18n.t('account.intoPasswordTips')}
                                        onChange={handleChange('password')}
                                        value={values.password}
                                        maxLength={20}
                                    />
                                </Form.Item>
                                <Form.Item className={`pl0 ${errors.rePassword && 'form-error'}`}>
                                    <Input
                                        type='password'
                                        className='pv4'
                                        placeholder={I18n.t('account.intoRePasswordTips')}
                                        onChange={handleChange('rePassword')}
                                        value={values.rePassword}
                                    />
                                </Form.Item>
                                <div
                                    className='flex row as pl0 mt20'
                                    onClick={() => {
                                        setFieldValue('agree', !values.agree)
                                    }}>
                                    <SvgIcon
                                        size={15}
                                        className={`mr10 ${values.agree ? 'cP' : 'cB'}`}
                                        style={{ marginTop: 3 }}
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
