import React from 'react'
import { Base, Nav, images, I18n } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'

export const UserSetting = () => {
    useStore('common.lang')
    const list = [
        {
            icon: images.com.lang,
            label: I18n.t('user.language'),
            path: '/user/lang'
        },
        {
            icon: images.com.network,
            label: I18n.t('user.network'),
            path: '/user/network'
        }
    ]
    return (
        <div className='page'>
            <Nav title={I18n.t('user.setting')} />
            <div>
                <div>
                    {list.map((e) => {
                        return (
                            <div
                                onClick={() => {
                                    Base.push(e.path)
                                }}
                                key={e.path}
                                className='press flex row ac jsb ph30 pv20 border-b'>
                                <div className='flex row ac'>
                                    <img style={{ width: 20, height: 20 }} src={e.icon} alt='' />
                                    <div className='fz17 ml10'>{e.label}</div>
                                </div>
                                <div>
                                    <img style={{ width: 16, height: 16 }} src={images.com.right} alt='' />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
