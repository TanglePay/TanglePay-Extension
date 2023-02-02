import React, { useRef, useState, useEffect, useImperativeHandle } from 'react'
import { Button, Mask, Form, Input } from 'antd-mobile'
import { I18n, IotaSDK } from '@tangle-pay/common'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { StepInput } from './stepInput'
import BigNumber from 'bignumber.js'

export const GasDialog = ({ dialogRef }) => {
    const [isShow, setShow] = useState(false)
    const [contentW, setContentW] = useState(375)
    const [curWallet, setCurWallet] = useState({})
    const callBackRef = useRef()
    const formRef = useRef()
    const [gasInfo, setGasInfo] = useState({})
    useImperativeHandle(
        dialogRef,
        () => {
            return {
                show
            }
        },
        []
    )
    const show = (gasInfo, callBack) => {
        const { gasLimit, gasPrice } = gasInfo
        if (formRef.current) {
            if (gasLimit) {
                setGasInfo({ ...gasInfo })
                formRef.current.setFieldValue('gasLimit', gasLimit)
                formRef.current.setFieldValue('gasPrice', gasPrice)
            }
        }
        if (gasLimit) {
            setGasInfo({ ...gasInfo })
        } else {
            setGasInfo({})
        }
        callBackRef.current = callBack
        setShow(true)
    }
    const hide = (info) => {
        setShow(false)
        if (info) {
            callBackRef.current && callBackRef.current({ ...info })
        }
    }
    useEffect(() => {
        setContentW(document.getElementById('app').offsetWidth)
    }, [])
    useEffect(() => {
        let { gasPrice, gasLimit } = gasInfo
        gasPrice = parseFloat(gasPrice)
        gasLimit = parseFloat(gasLimit)
        let total = 0
        if (gasPrice && gasLimit) {
            total = new BigNumber(gasPrice).times(gasLimit)
            total = IotaSDK.client.utils.fromWei(total.valueOf(), 'ether')
        }
        setGasInfo({
            ...gasInfo,
            total
        })
    }, [JSON.stringify(gasInfo)])
    return (
        <Mask opacity={0.3} onMaskClick={() => hide()} visible={isShow}>
            <div style={{ width: contentW - 32 }} className='radius10 bgW pa-c password-dialog'>
                <div className='border-b pv12 ph16 fz16 fw600'>{I18n.t('assets.editPriority')}</div>
                <div className='p16'>
                    <Formik
                        innerRef={formRef}
                        initialValues={{ ...gasInfo }}
                        isValidating={true}
                        validateOnBlur={false}
                        validateOnChange={false}
                        validateOnMount={false}
                        validationSchema={Yup.object().shape({
                            gasPrice: Yup.number().required(),
                            gasLimit: Yup.number().required()
                        })}
                        onSubmit={async (values) => {
                            console.log(values)
                            hide(gasInfo)
                        }}>
                        {({ setFieldValue, handleSubmit, values, errors }) => (
                            <Form>
                                <Form.Item className={`pl0 ${errors.gasPrice && 'form-error'}`}>
                                    <div className='fz18 mb10'>{I18n.t('assets.gasFee')}</div>
                                    <StepInput
                                        className='name-input'
                                        onChange={(e) => {
                                            setGasInfo({ ...gasInfo, gasPrice: e })
                                            setFieldValue('gasPrice', e)
                                        }}
                                        value={values.gasPrice}
                                    />
                                </Form.Item>
                                <Form.Item className={`pl0 ${errors.gasLimit && 'form-error'}`}>
                                    <div className='fz18 mb10'>{I18n.t('assets.gasLimit')}</div>
                                    <StepInput
                                        className='name-input'
                                        onChange={(e) => {
                                            setGasInfo({ ...values, gasLimit: e })
                                            setFieldValue('gasLimit', e)
                                        }}
                                        value={values.gasLimit}
                                    />
                                </Form.Item>
                                <Form.Item className={`pl0 `}>
                                    <div className='fz18 mb10'>{I18n.t('assets.maxFee')}</div>
                                    <div>{gasInfo.total}</div>
                                </Form.Item>
                                <div className='mt24'>
                                    <Button color='primary' block onClick={handleSubmit}>
                                        {I18n.t('assets.confirm')}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </Mask>
    )
}
