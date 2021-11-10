import React, { useRef } from 'react'
import { Button } from 'antd-mobile'
import { Nav, I18n, images } from '@/common'
import { TipsDialog } from './tipsDialog'

export const AccountBackup = () => {
    const dialogRef = useRef()
    const handleNext = () => {
        dialogRef.current.show()
    }
    return (
        <div className='page'>
            <Nav title={I18n.t('account.backupTitle')} />
            <div>
                <div className='flex c pv70'>
                    <img style={{ width: 60, height: 55 }} src={images.com.encrypt} alt=''></img>
                </div>
                <div className='ph50 pb30'>
                    <div className='mb30'>
                        <div className='fz16 fw500'>{I18n.t('account.backupTips')}</div>
                    </div>
                    <div style={{ marginBottom: 100 }}>
                        <div
                            className='fz14'
                            style={{ lineHeight: '20px' }}
                            dangerouslySetInnerHTML={{
                                __html: I18n.t('account.backupTipsContent').replace(/\n/g, '<br/>')
                            }}></div>
                    </div>
                    <Button size='large' color='primary' block onClick={handleNext}>
                        {I18n.t('account.next')}
                    </Button>
                </div>
            </div>
            <TipsDialog dialogRef={dialogRef} />
        </div>
    )
}
