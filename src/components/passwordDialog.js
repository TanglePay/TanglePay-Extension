import React, { useRef, useState, useImperativeHandle } from 'react'
import { Button, Mask, Form, Input } from 'antd-mobile'
import { I18n, IotaSDK, Toast } from '@/common'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useEditWallet } from '@/store/common'
import { useSelectWallet } from '@/store/common'
const contentW = document.body.offsetWidth
export const PasswordDialog = ({ dialogRef }) => {
    const [isShow, setShow] = useState(false)
    const [curWallet, setCurWallet] = useState({})
    const callBackRef = useRef()
    const formRef = useRef()
    const editWallet = useEditWallet()
    const selectWallet = useSelectWallet()
    useImperativeHandle(
        dialogRef,
        () => {
            return {
                show
            }
        },
        []
    )
    const show = (wallet, callBack) => {
        callBackRef.current = callBack
        if (formRef.current) {
            formRef.current.setFieldValue('password', '')
        }
        setShow(true)
        setCurWallet(wallet)
    }
    const hide = (info) => {
        setShow(false)
        callBackRef.current && callBackRef.current(info)
        if (!info) {
            // clear password selection given invalid password input
            selectWallet('')
        }
    }
    return (
        <Mask opacity={0.3} onMaskClick={() => hide()} visible={isShow}>
            <div style={{ width: contentW - 60 }} className='radius10 bgW p20 pa-c password-dialog'>
                <Formik
                    innerRef={formRef}
                    initialValues={{}}
                    isValidating={true}
                    validateOnBlur={false}
                    validateOnChange={false}
                    validateOnMount={false}
                    validationSchema={Yup.object().shape({
                        password: Yup.string().required()
                    })}
                    onSubmit={(values) => {
                        const { password } = values
                        // password is validated via decryption
                        try {
                            const res = IotaSDK.decryptSeed(curWallet.seed, password)
                            if (!res) {
                                Toast.error(I18n.t('assets.passwordError'))
                            } else {
                                const obj = {
                                    ...curWallet,
                                    password
                                }
                                editWallet(curWallet.id, obj)
                                hide(obj)
                            }
                        } catch (error) {
                            console.log(error)
                            Toast.error(I18n.t('assets.passwordError'))
                        }
                    }}>
                    {({ handleChange, handleSubmit, values, errors }) => (
                        <Form>
                            <div className='mt10 fz18 fw600 mb10'>{curWallet.name}</div>
                            <Form.Item className={`pl0 ${errors.password && 'form-error'}`}>
                                <Input
                                    type='password'
                                    className='name-input'
                                    placeholder={I18n.t('assets.passwordTips')}
                                    onChange={handleChange('password')}
                                    value={values.password}
                                />
                            </Form.Item>
                            <div className='mt30'>
                                <Button color='primary' size='large' block onClick={handleSubmit}>
                                    {I18n.t('assets.comfirm')}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </Mask>
    )
}
