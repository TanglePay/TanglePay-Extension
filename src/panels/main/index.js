import React, { useEffect } from 'react'
import { TabBar } from 'antd-mobile'
import { Assets } from './assets'
import { User } from './user'
import { Staking } from './staking'
import { I18n, IotaSDK } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import { useGetNodeWallet } from '@tangle-pay/store/common'
import { SvgIcon } from '@/common'
export const Main = () => {
    const [curKey, setActive] = useStore('common.curMainActive')
    const [curWallet] = useGetNodeWallet()
    const routes = [
        {
            key: 'assets',
            title: I18n.t('assets.assets')
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
    return (
        <div className='main flex column page'>
            <div style={{ display: curKey === 'assets' ? 'block' : 'none' }} className='flex1'>
                <Assets />
            </div>
            <div style={{ display: curKey === 'me' ? 'block' : 'none' }} className='flex1'>
                <User />
            </div>
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
