import React, { useEffect, useState } from 'react'
import { TabBar } from 'antd-mobile'
import { Assets } from './assets'
import { User } from './user'
import { Discover } from './discover'
import { Apps } from './apps'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import { useGetNodeWallet } from '@tangle-pay/store/common'
import { SvgIcon } from '@/common'
import Bridge from '@/common/bridge'
export const Main = () => {
    const initRoutes = [
        {
            key: 'assets',
            title: I18n.t('assets.assets'),
            size: 30
        },
        {
            key: 'apps',
            title: I18n.t('apps.title'),
            size: 30
        },
        // {
        //     key: 'staking',
        //     title: I18n.t('discover.title'),
        //     size: 30
        // },
        {
            key: 'me',
            title: I18n.t('user.me'),
            size: 30
        }
    ]
    const [lang] = useStore('common.lang')
    const [curKey, setActive] = useStore('common.curMainActive')
    const [curWallet] = useGetNodeWallet()
    const [opacity, setOpacity] = useState(0)
    const [routes, setRoutes] = useState([...initRoutes])
    useEffect(() => {
        IotaSDK.changeNodesLang(lang)
    }, [lang])
    useEffect(() => {
        IotaSDK.setMqtt(curWallet.address)

        // cache curAddress
        Bridge.cacheBgData('cur_wallet_address', `${curWallet.address || ''}_${curWallet.nodeId || ''}`)
    }, [curWallet.address + curWallet.nodeId])
    useEffect(() => {
        const filterMenuList = IotaSDK.nodes.find((e) => e.id == curWallet.nodeId)?.filterMenuList || []
        setRoutes([...initRoutes.filter((e) => !filterMenuList.includes(e.key))])
    }, [curWallet.nodeId, JSON.stringify(initRoutes)])
    useEffect(() => {
        setTimeout(() => {
            setOpacity(1)
        }, 500)
    }, [])
    // tangleSDK
    useEffect(() => {
        window.Bridge = Bridge
        if (curWallet.password) {
            Bridge.connect(window.location.search)
        }
    }, [curWallet.password])
    useEffect(() => {
        if (curWallet.password && curWallet.address) {
            Bridge.sendEvt('accountsChanged', {
                address: curWallet.address,
                nodeId: curWallet.nodeId
            })
        }
    }, [curWallet.password + curWallet.address + curWallet.nodeId])
    return (
        <div style={{ opacity }} className='main flex column page'>
            <div style={{ display: curKey === 'assets' ? 'block' : 'none' }} className='flex1'>
                <Assets tabKey={curKey} />
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
                <Discover />
            </div>
            <TabBar className='border-t' activeKey={curKey} onChange={setActive}>
                {routes.map((item) => (
                    <TabBar.Item
                        key={item.key}
                        style={{ paddingBottom: 14 }}
                        icon={(e) => {
                            return <SvgIcon key={item.key} name={item.key} size={item.size} />
                        }}
                        title={
                            <div className={'fz14 mt8'} style={{ transform: 'scale(0.9)' }}>
                                {item.title}
                            </div>
                        }
                    />
                ))}
            </TabBar>
        </div>
    )
}
