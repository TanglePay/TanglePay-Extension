import React, { useState, useEffect, useImperativeHandle } from 'react'
import { Mask, Button } from 'antd-mobile'
import { Base, I18n } from '@tangle-pay/common'

export const SendFailDialog = ({ dialogRef }) => {
    const [isShow, setShow] = useState(false)
    const [contentW, setContentW] = useState(375)
    useEffect(() => {
        setContentW(document.getElementById('app').offsetWidth)
    }, [])
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
    return (
        <Mask opacity={0.3} onMaskClick={() => setShow(false)} visible={isShow}>
            <div style={{ width: contentW - 60 }} className='radius10 bgW pa-c'>
                <div className='p16 fz16'>
                    <span>{I18n.t('shimmer.sendFailTips')}</span>
                </div>
                <div className='ph16 pb16'>
                    <Button
                        onClick={() => {
                            setShow(false)
                        }}
                        color='primary'
                        block>
                        {I18n.t('shimmer.sendCancel')}
                    </Button>
                </div>
            </div>
        </Mask>
    )
}
