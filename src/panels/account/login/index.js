import React, { useRef } from 'react'
import { Button } from 'antd-mobile'
import { Base, I18n } from '@tangle-pay/common'
import { AddDialog } from '../../assets/wallets/addDialog'

export const AccountLogin = () => {
    const dialogRef = useRef()
    return (
        <div className='page mask-content-je flex ac je'>
            <div className='ph24 w100 h100' style={{ paddingTop: 160 }}>
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
                <div className='mt70 pt65'>
                    <Button
                        color='primary'
                        size='large'
                        block
                        onClick={() => {
                            // Base.push('/account/register')
                            dialogRef.current.show()
                        }}>
                        {I18n.t('assets.addWallets')}
                    </Button>
                    {/* <Button
                        color='primary'
                        size='large'
                        className='mt20'
                        fill='none'
                        block
                        onClick={() => {
                            dialogRef.current.show()
                        }}>
                        {I18n.t('account.hasWallet')}
                    </Button> */}
                </div>
            </div>
            <AddDialog dialogRef={dialogRef} />
        </div>
    )
}
