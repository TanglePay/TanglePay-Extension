import React from 'react'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import { SvgIcon, Nav } from '@/common'
import { useGetNodeWallet } from '@tangle-pay/store/common'
import { useGetParticipationEvents, useGetRewards } from '@tangle-pay/store/staking'

export const User = () => {
    const [curWallet] = useGetNodeWallet()
    useGetParticipationEvents()
    useGetRewards(curWallet, false)
    const curNode = IotaSDK.nodes.find((d) => d.id == curWallet.nodeId)
    const filterMenuList = curNode?.filterMenuList || []
    const hasStake = !filterMenuList.includes('staking')
    useStore('common.lang')
    const list = [
        {
            icon: 'wallet',
            label: I18n.t('user.manageWallets'),
            // path: 'user/wallets'
            path: 'user/editWallet'
        },
        hasStake && {
            icon: 'stake',
            label: I18n.t('staking.title'),
            path: 'stake/index'
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
    ].filter((e) => !!e)
    return (
        <div className='user-page'>
            <Nav backArrow={false} title={I18n.t('user.me')}></Nav>
            <div>
                {list.map((e) => {
                    return (
                        <div
                            onClick={() => {
                                if (e.path === 'user/editWallet' && !curWallet.address) {
                                    Base.push('assets/wallets')
                                } else {
                                    Base.push(e.path)
                                }
                            }}
                            key={e.path}
                            style={{ height: 58 }}
                            className='flex row ac jsb ph16 border-b press'>
                            <div className='flex row ac'>
                                <SvgIcon name={e.icon} size={23} className='cP' />
                                <span className='fz18 ml16'>{e.label}</span>
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
