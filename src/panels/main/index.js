import React, { useEffect } from 'react'
import { TabBar } from 'antd-mobile'
import { Assets } from './assets'
import { User } from './user'
import { images, I18n, IotaSDK } from '@/common'
import { useStore } from '@/store'
import { useGetNodeWallet } from '@/store/common'
export const Main = () => {
    const [curKey, setActive] = useStore('common.curMainActive')
    const [curWallet] = useGetNodeWallet()
    const [, refreshAssets] = useStore('common.forceRequest')
    const routes = [
        {
            key: 'assets',
            title: I18n.t('assets.assets'),
            activeIcon: images.com.assets_1,
            icon: images.com.assets_0
        },
        {
            key: 'user',
            title: I18n.t('user.me'),
            activeIcon: images.com.me_1,
            icon: images.com.me_0
        }
    ]
    useEffect(() => {
        IotaSDK.setMqtt(curWallet.address, refreshAssets)
    }, [curWallet.address])
    return (
        <div className='main flex column page'>
            <div style={{ display: curKey === 'assets' ? 'block' : 'none' }} className='flex1'>
                <Assets />
            </div>
            <div style={{ display: curKey === 'user' ? 'block' : 'none' }} className='flex1'>
                <User />
            </div>
            <TabBar className='border-t' activeKey={curKey} onChange={setActive}>
                {routes.map((item) => (
                    <TabBar.Item
                        key={item.key}
                        icon={(e) => {
                            return (
                                <img style={{ width: 18, height: 18 }} src={e ? item.activeIcon : item.icon} alt='' />
                            )
                        }}
                        title={item.title}
                    />
                ))}
            </TabBar>
        </div>
    )
}
