import React, { useState, useImperativeHandle, useEffect } from 'react'
import { Button, Mask, Form, Input } from 'antd-mobile'
import { I18n } from '@tangle-pay/common'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useEditWallet } from '@tangle-pay/store/common'
import './nameDialog.less'

export const NameDialog = ({ dialogRef, data }) => {
    const editWallet = useEditWallet()
    const [contentW, setContentW] = useState(375)
    const [isShow, setShow] = useState(false)
    useImperativeHandle(
        dialogRef,
        () => {
            return {
                show
            }
        },
        []
    )
    const show = () => {
        setShow(true)
    }
    const hide = () => {
        setShow(false)
    }
    useEffect(() => {
        setContentW(document.getElementById('app').offsetWidth)
    }, [])
    return (
        <Mask opacity={0.3} onMaskClick={hide} visible={isShow}>
            <div style={{ width: contentW - 32 }} className='radius10 bgW p16 pa-c name-dialog'>
                <Formik
                    initialValues={{
                        name: data.name
                    }}
                    isValidating={true}
                    validationSchema={Yup.object().shape({
                        name: Yup.string().required()
                    })}
                    onSubmit={(values) => {
                        editWallet(data.id, { name: values.name })
                        hide()
                    }}>
                    {({ handleChange, handleSubmit, values, errors }) => (
                        <Form>
                            <div className='mb10 fz18 fw600'>{I18n.t('account.intoName')}</div>
                            <Form.Item className={`pl0 ${errors.name && 'form-error'}`}>
                                <Input
                                    className='name-input'
                                    placeholder={I18n.t('account.intoNameTips')}
                                    onChange={handleChange('name')}
                                    value={values.name}
                                />
                            </Form.Item>
                            <div className='mt24'>
                                <Button color='primary' size='large' block onClick={handleSubmit}>
                                    {I18n.t('assets.confirm')}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </Mask>
    )
}
