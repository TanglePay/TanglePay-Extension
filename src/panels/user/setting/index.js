import React, { useEffect, useState } from 'react'
import { Base, I18n } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import { Nav, SvgIcon } from '@/common'
import { Switch } from 'antd-mobile'

export const UserSetting = () => {
    useStore('common.lang')
    const [isNoRestake, setNoRestake] = useState(false)
    const [list, setList] = useState([])
    useEffect(() => {
        Base.getLocalData('common.isNoRestake').then((res) => {
            setNoRestake(res != 1)
        })
    }, [])
    useEffect(() => {
        Base.setLocalData('common.isNoRestake', isNoRestake ? 0 : 1)
        setList([
            {
                icon: 'lang',
                label: I18n.t('user.language'),
                path: '/user/lang',
                size: 24
            },
            {
                icon: 'stake',
                label: 'restake',
                type: 'switch',
                value: isNoRestake,
                onChange: (e) => setNoRestake(e),
                size: 22
            }
            // {
            //     icon: 'network',
            //     label: I18n.t('user.network'),
            //     path: '/user/network',
            //     size: 20
            // }
        ])
    }, [isNoRestake])
    return (
        <div className='page'>
            <Nav title={I18n.t('user.setting')} />
            <div>
                <div>
                    {list.map((e, i) => {
                        return (
                            <div
                                onClick={
                                    e.path
                                        ? () => {
                                              Base.push(e.path)
                                          }
                                        : null
                                }
                                key={i}
                                className={`${e.path ? 'press' : ''} flex row ac jsb p16 border-b`}>
                                <div className='flex row ac'>
                                    <SvgIcon name={e.icon} size={e.size} className='cB' />
                                    <div className='fz18 ml12'>{e.label}</div>
                                </div>
                                <div>
                                    {e.type === 'switch' ? (
                                        <Switch key={i} checked={e.value} onChange={e.onChange} />
                                    ) : (
                                        <SvgIcon name='right' size={16} className='cB' />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
