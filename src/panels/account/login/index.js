import React, { useRef } from 'react'
import { Button } from 'antd-mobile'
import { Base, I18n } from '@tangle-pay/common'
import { IntoDialog } from './intoDialog'

export const AccountLogin = () => {
    const dialogRef = useRef()
    return (
        <div className='page mask-content-je flex ac je'>
            <div className='mb40 ph24 w100 mt80'>
                <div className='fw600 mb32 tc' style={{ fontSize: 32 }}>
                    {I18n.t('account.title')
                        .split('##')
                        .filter((e) => !!e)
                        .map((e, i) => {
                            return (
                                <span key={i} className={`${i == 0 ? 'cP' : ''}`}>
                                    {e}
                                </span>
                            )
                        })}
                </div>
                <div
                    className='fz16 tc'
                    style={{
                        color: '#333',
                        lineHeight: '18px'
                    }}
                    dangerouslySetInnerHTML={{ __html: I18n.t('account.subTitle').replace(/\n/g, '<br/>') }}></div>
                <div className='mt70 pt60 pb70'>
                    <Button
                        color='primary'
                        size='large'
                        block
                        onClick={() => {
                            Base.push('/account/register')
                        }}>
                        {I18n.t('account.create')}
                    </Button>
                    <Button
                        color='primary'
                        size='large'
                        className='mt20'
                        fill='none'
                        block
                        onClick={() => {
                            dialogRef.current.show()
                        }}>
                        {I18n.t('account.hasWallet')}
                    </Button>
                </div>
            </div>
            <IntoDialog dialogRef={dialogRef} />
        </div>
    )
}
