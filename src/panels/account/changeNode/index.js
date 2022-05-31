import React from 'react'
import { Base, Nav, S, SS, I18n, IotaSDK } from '@tangle-pay/common'
import { useChangeNode } from '@tangle-pay/store/common'
import { useStore } from '@tangle-pay/store'
import { default as logo_nobg } from '@tangle-pay/assets/images/logo_nobg.png'

export const AccountChangeNode = () => {
    const changeNode = useChangeNode()
    return (
        <div className='page flex column'>
            <div className='flex jsb column flex1 pt40'>
                <div className='ph25'>
                    <img className='mb20' style={{ width: 144, height: 150 }} src={logo_nobg} />
                    <div>
                        <div className='fz30 fw500 mb15'>{I18n.t('account.dearFam')}</div>
                        <div
                            className='fz14'
                            style={{ lineHeight: '22px' }}
                            dangerouslySetInnerHTML={{
                                __html: I18n.t('account.betaReady').replace(/\n/g, '<br/>')
                            }}></div>
                    </div>
                </div>
                <div
                    className='ph15 pv30'
                    style={{ backgroundColor: '#1F7EFC', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
                    <div className='fz14 tc cW'>{I18n.t('account.changeTips')}</div>
                    <div className='mt20 mb10 bgW' style={{ borderRadius: 16 }}>
                        {IotaSDK.nodes.map((e, i) => {
                            return (
                                <div
                                    key={e.id}
                                    className={`press pv20 flex c ${i === 0 && 'border-b'}`}
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
