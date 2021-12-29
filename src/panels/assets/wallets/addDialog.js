import React, { useState, useImperativeHandle } from 'react'
import { Mask } from 'antd-mobile'
import { I18n, Base } from '@tangle-pay/common'
import { Toast } from '@/common'
export const AddDialog = ({ dialogRef }) => {
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
            <div className='ph20 pb50 w100 radius10 bgS'>
                <div className='flex c pv15'>
                    <div className='fz16 cS'>{I18n.t('assets.addWallets')}</div>
                </div>
                <div
                    onClick={() => {
                        hide()
                        Base.push('/account/register')
                    }}
                    className='pv30 flex c bgW radius10 press'>
                    <div className='fz18'>{I18n.t('account.createTitle')}</div>
                </div>
                <div className='fz16 cS mt20 mb10'>{I18n.t('account.intoBtn')}</div>
                <div className='bgW radius10'>
                    <div
                        onClick={() => {
                            hide()
                            Base.push('/account/into', { type: 1 })
                        }}
                        className='pv30 flex c press'>
                        <div className='fz18'>{I18n.t('account.intoTitle1')}</div>
                    </div>
                    <div
                        onClick={() => {
                            hide()
                            Toast.show(I18n.t('account.unopen'))
                            // Base.push('/account/into', { type: 2 });
                        }}
                        className='pv30 flex c border-t press'>
                        <div className='fz18'>{I18n.t('account.intoTitle2')}</div>
                    </div>
                </div>
            </div>
        </Mask>
    )
}
