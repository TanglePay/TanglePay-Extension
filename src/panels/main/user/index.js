import React from 'react'
import { Base, I18n, images } from '@tangle-pay/common'
import { NavBar } from 'antd-mobile'
import { useStore } from '@tangle-pay/store'

export const User = () => {
    useStore('common.lang')
    const list = [
        {
            icon: images.com.wallet,
            label: I18n.t('user.manageWallets'),
            path: 'user/wallets'
        },
        {
            icon: images.com.set,
            label: I18n.t('user.setting'),
            path: 'user/setting'
        },
        {
            icon: images.com.about,
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
                                <img style={{ width: 20, height: 20 }} src={e.icon} alt='' />
                                <span className='fz17 ml10'>{e.label}</span>
                            </div>
                            <div>
                                <img style={{ width: 16, height: 16 }} src={images.com.right} alt='' />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
