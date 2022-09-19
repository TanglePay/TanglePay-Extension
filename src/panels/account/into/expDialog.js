import React, { useState, useImperativeHandle } from 'react'
import { Button, Mask } from 'antd-mobile'
import { I18n, Base, IotaSDK } from '@tangle-pay/common'
export const ExpDialog = ({ dialogRef }) => {
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
    return (
        <Mask className='m0' opacity={0.3} onMaskClick={hide} visible={isShow}>
            <div className='w100 ph16 pa-c'>
                <div className='bgW' style={{ borderRadius: 16, overflow: 'hidden' }}>
                    <div className='pv12 w100 ph16 fz18 fw600 border-b'>{I18n.t('account.mnemonicExp')}</div>
                    <div className='p16'>
                        <div
                            className='fz16 p12 pt10 radius10'
                            style={{ border: '1px solid #000', lineHeight: '20px' }}>
                            {IotaSDK.getMnemonic()}
                        </div>
                        <div className='pt16'>
                            <Button
                                color='primary'
                                size='large'
                                block
                                onClick={() => {
                                    hide()
                                }}>
                                {I18n.t('shimmer.understand')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Mask>
    )
}
