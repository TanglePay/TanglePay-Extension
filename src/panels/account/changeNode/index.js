import React from 'react'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { useChangeNode } from '@tangle-pay/store/common'
import { default as logo_nobg } from '@tangle-pay/assets/images/logo_nobg.png'

export const AccountChangeNode = () => {
    const changeNode = useChangeNode()
    return (
        <div className='page flex column'>
            <div className='flex jsb column flex1 pt30'>
                <div className='ph25'>
                    <img className='mb20' style={{ width: 144, height: 150 }} src={logo_nobg} />
                    <div>
                        <div className='fz30 fw500 mb10'>{I18n.t('account.dearFam')}</div>
                        <div
                            className='fz14'
                            style={{ lineHeight: '19px' }}
                            dangerouslySetInnerHTML={{
                                __html: I18n.t('account.betaReady').replace(/\n/g, '<br/>')
                            }}></div>
                    </div>
                </div>
                <div
                    className='ph15 pv25'
                    style={{ backgroundColor: '#1F7EFC', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
                    <div className='fz14 cW'>{I18n.t('account.changeTips')}</div>
                    <div className='mt20 bgW' style={{ borderRadius: 16, maxHeight: 175, overflow: 'scroll' }}>
                        {IotaSDK.nodes.map((e, i) => {
                            return (
                                <div
                                    key={e.id}
                                    className={`press pv20 flex c ${i != 0 && 'border-t'}`}
                                    onClick={async () => {
                                        await changeNode(e.id)
                                        Base.push('/account/login')
                                    }}>
                                    <div className='fz15 fw500'>{e.name}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
