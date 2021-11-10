import React, { useState, useImperativeHandle } from 'react'
import { Button, Mask } from 'antd-mobile'
import { I18n, Base, images } from '@/common'
export const TipsDialog = ({ dialogRef }) => {
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
            <div className='flex c w100' style={{ height: '100vh' }}>
                <div className='ph20 pt50 pb20 w100 radius10 bgS mt70'>
                    <div className='mb20 flex column ac pv30 ph50 bgW radius10'>
                        <div>
                            <img style={{ width: 55, height: 55 }} src={images.com.no_screenshot} alt='' />
                        </div>
                        <div className='mt20'>
                            <div className='fz16 fw500 tc mb10'>{I18n.t('account.backupScreenshoptTitle')}</div>
                            <div className='fz14 tc cS' style={{ lineHeight: '20px' }}>
                                {I18n.t('account.backupScreenshoptTips')}
                            </div>
                        </div>
                    </div>
                    <div className='ph20'>
                        <Button
                            color='primary'
                            size='large'
                            block
                            onClick={() => {
                                hide()
                                Base.push('/account/mnemonic')
                            }}>
                            {I18n.t('account.backupScreenshoptBtn')}
                        </Button>
                    </div>
                </div>
            </div>
        </Mask>
    )
}
