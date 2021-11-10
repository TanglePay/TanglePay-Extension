import React, { useState, useImperativeHandle } from 'react'
import { Mask } from 'antd-mobile'
import { I18n, Base, Toast } from '@/common'
export const IntoDialog = ({ dialogRef }) => {
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
            <div className='p30 w100 radius10 bgS'>
                <div className='mv20 bgW radius10'>
                    <div
                        className='pv30 flex c press'
                        onClick={() => {
                            hide()
                            Base.push('/account/into', { type: 1 })
                        }}>
                        <div className='fz17'>{I18n.t('account.intoTitle1')}</div>
                    </div>
                    <div
                        className='pv30 flex c press border-t'
                        onClick={() => {
                            hide()
                            Toast.show(I18n.t('account.unopen'))
                            // Base.push('/account/into', { type: 2 });
                        }}>
                        <div className='fz17'>{I18n.t('account.intoTitle2')}</div>
                    </div>
                </div>
            </div>
        </Mask>
    )
}
