import React, { useEffect, useState } from 'react'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { context } from '@tangle-pay/domain'
import { useStore } from '@tangle-pay/store'
import { Nav, SvgIcon, Toast } from '@/common'
import { Switch } from 'antd-mobile'
import { useChangeNode } from '@tangle-pay/store/common'

export const UserSetting = () => {
    useStore('common.lang')
    const changeNode = useChangeNode()
    const [isNoRestake, setNoRestake] = useState(false)
    const list = [
        {
            icon: 'lang',
            label: I18n.t('user.language'),
            size: 24,
            onClick: () => {
                Base.push('/user/lang')
            }
        },
        {
            icon: 'stake',
            label: I18n.t('staking.restake'),
            type: 'switch',
            value: isNoRestake,
            onChange: (e) => {
                setNoRestake(e)
                Base.setLocalData('common.isNoRestake', e ? 0 : 1)
            },
            size: 22
        },
        {
            icon: 'advanced',
            label: 'Advanced',
            onClick: () => {
                Base.push('/user/advanced')
            },
            size: 22
        },
        {
            icon: 'pin',
            label: context.state.isPinSet ? I18n.t('account.resetPinTitle') : I18n.t('account.setPinButton'),
            onClick: () => {
                Base.push(context.state.isPinSet ? '/account/pin/reset' : '/account/pin/set')
            },
            size: 22
        }
    ]
    const curNodeKey = IotaSDK?.curNode?.curNodeKey
    if (curNodeKey) {
        list.push({
            icon: 'network',
            label: I18n.t('user.network'),
            size: 20,
            right: <div className='fz16 cS'>{curNodeKey}</div>,
            onClick: async () => {
                const curNodeId = IotaSDK?.curNode?.id
                Toast.showLoading()
                try {
                    await IotaSDK.getNodes()
                    if (curNodeId) {
                        await changeNode(curNodeId)
                        IotaSDK.refreshAssets()
                    }
                    Toast.hideLoading()
                } catch (error) {
                    Toast.hideLoading()
                }
            }
        })
    }
    useEffect(() => {
        Base.getLocalData('common.isNoRestake').then((res) => {
            setNoRestake(res != 1)
        })
    }, [])
    return (
        <div className='page'>
            <Nav title={I18n.t('user.setting')} />
            <div>
                <div>
                    {list.map((e, i) => {
                        console.log(i,e);
                        return (
                            <div
                                onClick={e.onClick ? e.onClick : null}
                                key={i}
                                className={`${!!e.onClick ? 'press' : ''} flex row ac jsb p16 border-b`}>
                                <div className='flex row ac'>
                                    <SvgIcon name={e.icon} size={e.size} className='cB' />
                                    <div className='fz18 ml12'>{e.label}</div>
                                </div>
                                <div>
                                    {e.type === 'switch' ? (
                                        <Switch key={i} checked={e.value} onChange={e.onChange} />
                                    ) : e.right ? (
                                        e.right
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
