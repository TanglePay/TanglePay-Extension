import React, { useRef } from 'react'
import { Button } from 'antd-mobile'
import { I18n, Base } from '@tangle-pay/common'
import { TipsDialog } from './tipsDialog'
import { Nav, SvgIcon } from '@/common'
import { useStore } from '@tangle-pay/store'

export const AccountBackup = () => {
    const [lang] = useStore('common.lang')
    const dialogRef = useRef()
    const handleNext = () => {
        // dialogRef.current.show()
        Base.push('/account/mnemonic')
    }
    return (
        <div className='page'>
            <Nav title={I18n.t('account.backupTitle')} />
            <div>
                <div className={`flex c pt50 pb40`}>
                    <SvgIcon size={70} name='encrypt' className='cB' />
                </div>
                <div className='ph24 pb30'>
                    <div className='mb12'>
                        <div className='fz16 fw600 cP'>{I18n.t('account.backupTips')}</div>
                    </div>
                    <div style={{ marginBottom: 80 }}>
                        <div
                            className='fz16'
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
