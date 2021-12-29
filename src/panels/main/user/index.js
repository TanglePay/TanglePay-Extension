import React from 'react'
import { Base, I18n } from '@tangle-pay/common'
import { NavBar } from 'antd-mobile'
import { useStore } from '@tangle-pay/store'
import { SvgIcon } from '@/common'

export const User = () => {
    useStore('common.lang')
    const list = [
        {
            icon: 'wallet',
            label: I18n.t('user.manageWallets'),
            path: 'user/wallets'
        },
        {
            icon: 'set',
            label: I18n.t('user.setting'),
            path: 'user/setting'
        },
        {
            icon: 'about',
            label: I18n.t('user.aboutUs'),
            path: 'user/aboutUs'
        }
    ]
    return (
        <div className='user-page'>
            <NavBar backArrow={false}>{I18n.t('user.me')}</NavBar>
            <div>
                {list.map((e) => {
                    return (
                        <div
                            onClick={() => {
                                Base.push(e.path)
                            }}
                            key={e.path}
                            className='flex row ac jsb ph30 pv20 border-b press'>
                            <div className='flex row ac'>
                                <SvgIcon name={e.icon} size={24} className='cB' />
                                <span className='fz17 ml10'>{e.label}</span>
                            </div>
                            <div>
                                <SvgIcon name='right' size={15} className='cB' />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
