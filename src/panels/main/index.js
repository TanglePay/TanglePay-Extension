import React, { useEffect, useState } from 'react'
import { TabBar } from 'antd-mobile'
import { Assets } from './assets'
import { User } from './user'
import { Staking } from './staking'
import { Apps } from './apps'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import { useGetNodeWallet } from '@tangle-pay/store/common'
import { SvgIcon } from '@/common'
import Bridge from '@/common/bridge'
export const Main = () => {
    const [curKey, setActive] = useStore('common.curMainActive')
    const [curWallet] = useGetNodeWallet()
    const [opacity, setOpacity] = useState(0)
    const routes = [
        {
            key: 'assets',
            title: I18n.t('assets.assets')
        },
        {
            key: 'apps',
            title: I18n.t('apps.title')
        },
        {
            key: 'staking',
            title: I18n.t('staking.title')
        },
        {
            key: 'me',
            title: I18n.t('user.me')
        }
    ]
    useEffect(() => {
        IotaSDK.setMqtt(curWallet.address)
    }, [curWallet.address])
    useEffect(() => {
        setTimeout(() => {
            setOpacity(1)
        }, 500)

        // tangleSDK
        Bridge.connect(window.location.search)
    }, [])
    return (
        <div style={{ opacity }} className='main flex column page'>
            <div style={{ display: curKey === 'assets' ? 'block' : 'none' }} className='flex1'>
                <Assets />
            </div>
            {curKey === 'apps' && (
                <div className='flex1'>
                    <Apps />
                </div>
            )}
            {curKey === 'me' && (
                <div className='flex1'>
                    <User />
                </div>
            )}
            <div style={{ display: curKey === 'staking' ? 'block' : 'none' }} className='flex1'>
                <Staking />
            </div>
            <TabBar className='border-t' activeKey={curKey} onChange={setActive}>
                {routes.map((item) => (
                    <TabBar.Item
                        key={item.key}
                        icon={(e) => {
                            return <SvgIcon key={item.key} name={item.key} size={item.key === 'staking' ? 22 : 18} />
                        }}
                        title={item.title}
                    />
                ))}
            </TabBar>
        </div>
    )
}
