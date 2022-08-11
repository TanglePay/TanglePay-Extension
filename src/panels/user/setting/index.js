import React from 'react'
import { Base, I18n } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import { Nav, SvgIcon } from '@/common'

export const UserSetting = () => {
    useStore('common.lang')
    const list = [
        {
            icon: 'lang',
            label: I18n.t('user.language'),
            path: '/user/lang',
            size: 24
        }
        // {
        //     icon: 'network',
        //     label: I18n.t('user.network'),
        //     path: '/user/network',
        //     size: 20
        // }
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
                                className='press flex row ac jsb p16 border-b'>
                                <div className='flex row ac'>
                                    <SvgIcon name={e.icon} size={e.size} className='cB' />
                                    <div className='fz18 ml12'>{e.label}</div>
                                </div>
                                <div>
                                    <SvgIcon name='right' size={16} className='cB' />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
