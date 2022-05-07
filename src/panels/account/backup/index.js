import React, { useRef } from 'react'
import { Button } from 'antd-mobile'
import { I18n } from '@tangle-pay/common'
import { TipsDialog } from './tipsDialog'
import { Nav, SvgIcon } from '@/common'
import { useStore } from '@tangle-pay/store'

export const AccountBackup = () => {
    const [lang] = useStore('common.lang')
    const dialogRef = useRef()
    const handleNext = () => {
        dialogRef.current.show()
    }
    return (
        <div className='page'>
            <Nav title={I18n.t('account.backupTitle')} />
            <div>
                <div className={`flex c ${lang == 'de' ? 'pv40' : 'pv70'}`}>
                    <SvgIcon size={70} name='encrypt' className='cB' />
                </div>
                <div className='ph50 pb30'>
                    <div className='mb30'>
                        <div className='fz16 fw500'>{I18n.t('account.backupTips')}</div>
                    </div>
                    <div style={{ marginBottom: lang == 'de' ? 80 : 100 }}>
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
