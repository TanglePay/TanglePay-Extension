import React from 'react'
import { Nav, SvgIcon, NoData } from '@/common'
import { Base, I18n } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import { Button, Dialog } from 'antd-mobile'
import { useHandleUnlocalConditions } from '@tangle-pay/store/common'
import './index.less'

const Item = (item) => {
    const { onDismiss } = useHandleUnlocalConditions()
    const toggleDom = (e, icon) => {
        const dom = document.getElementById(`action_${item.i}`)
        const classList = dom.classList
        if (icon && !classList.contains('move-show')) {
            classList.add('move-show')
        } else {
            classList.remove('move-show')
        }
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }
    }
    return (
        <div className='border-b' id={`action_${item.i}`} onClick={toggleDom} style={{ overflow: 'hidden' }}>
            <div style={{ height: 72 }} className='w100 flex ac row'>
                <div className='flex c pr' style={{ height: 72, width: 80 }}>
                    <img
                        className='border pa bgW'
                        style={{ width: 32, height: 32, borderRadius: 32, left: 24, opacity: 1, top: 20, zIndex: 0 }}
                        src={item.logoUrl}
                        alt=''
                        onError={(e) => {
                            e.target.style.opacity = 0
                        }}
                    />
                    <div
                        className='border bgP flex c cW fw600 fz24'
                        style={{ width: 32, height: 32, borderRadius: 32 }}>
                        {String(item.token).toLocaleUpperCase()[0]}
                    </div>
                </div>
                <div className='flex ac flex1 border-b' style={{ height: 72 }}>
                    <div style={{ width: 100 }} className='cP fz16 fw600'>
                        {item.token}: {item.amountStr}
                    </div>
                    <div style={{ width: 130 }}>
                        <div className='fz16 fw400 ellipsis mb4'>{item.blockId}</div>
                        <div className='fz16 fw400 ellipsis'>
                            {I18n.t('assets.tradingFrom')} {Base.handleAddress(item.unlockAddress)}
                        </div>
                    </div>
                </div>
            </div>
            <div className='w100 flex ac row jsb pr24 press adm-swipe-action-track' style={{ height: 60 }}>
                <div className='flex ac row'>
                    <div className='flex c' style={{ width: 80 }}>
                        <SvgIcon size='24' style={{ width: 24, height: 24 }} name='tradingTime' />
                    </div>
                    <div className='fz16 fw400'>{item.timeStr}</div>
                </div>
                <SvgIcon
                    onClick={(e) => toggleDom(e, true)}
                    className='cP press add-icon'
                    style={{ width: 24, height: 24 }}
                    size='24'
                    name='add'
                />
                <div className='flex ac adm-swipe-action-actions' style={{ right: -180, position: 'absolute' }}>
                    <Button
                        color='default'
                        onClick={() => {
                            Dialog.confirm({
                                content: I18n.t('assets.dismissTips'),
                                cancelText: I18n.t('apps.cancel'),
                                confirmText: I18n.t('apps.execute'),
                                onConfirm: () => {
                                    onDismiss(item.blockId)
                                }
                            })
                        }}>
                        {I18n.t('shimmer.dismiss')}
                    </Button>
                    <Button
                        color='primary'
                        onClick={() => {
                            Base.push('/assets/trading', {
                                id: item.blockId
                            })
                        }}>
                        {I18n.t('shimmer.accept')}
                    </Button>
                </div>
            </div>
        </div>
    )
}

const LockedItem = (item) => {
    return (
        <div className='border-b' style={{ overflow: 'hidden' }}>
            <div style={{ height: 72 }} className='w100 flex ac row'>
                <div className='flex c pr' style={{ height: 72, width: 80 }}>
                    <img
                        className='border pa bgW'
                        style={{ width: 32, height: 32, borderRadius: 32, left: 24, opacity: 1, top: 20, zIndex: 0 }}
                        src={item.logoUrl}
                        alt=''
                        onError={(e) => {
                            e.target.style.opacity = 0
                        }}
                    />
                    <div
                        className='border bgP flex c cW fw600 fz24'
                        style={{ width: 32, height: 32, borderRadius: 32 }}>
                        {String(item.token).toLocaleUpperCase()[0]}
                    </div>
                </div>
                <div className='flex ac flex1 border-b' style={{ height: 72 }}>
                    <div style={{ width: 100 }} className='cP fz16 fw600'>
                        {item.token}: {item.amountStr}
                    </div>
                    <div style={{ width: 130 }}>
                        <div className='fz16 fw400 ellipsis mb4'>{item.blockId}</div>
                        <div className='fz16 fw400 ellipsis'>
                            {I18n.t('assets.tradingFrom')} {Base.handleAddress(item.unlockAddress)}
                        </div>
                    </div>
                </div>
            </div>
            <div className='w100 flex ac row jsb pr24 adm-swipe-action-track' style={{ height: 60 }}>
                <div className='flex ac row'>
                    <div className='flex c' style={{ width: 80 }}>
                        <SvgIcon size='24' style={{ width: 24, height: 24 }} name='tradingTime' />
                    </div>
                    <div className='fz16 fw400'>{item.timeStr}</div>
                </div>
                <div className='bgS fz14' style={{ borderRadius: 4, padding: '2px 10px' }}>
                    locked
                </div>
            </div>
        </div>
    )
}

export const AssetsTradingList = () => {
    const [unlockConditions] = useStore('common.unlockConditions')
    const [lockedList] = useStore('common.lockedList')
    return (
        <div className='page assets-trading'>
            <Nav title={I18n.t('assets.tradingList')} />
            {unlockConditions.length > 0 || lockedList.length > 0 ? (
                <div>
                    {unlockConditions.map((e, i) => {
                        return <Item {...e} key={e.blockId} i={i} />
                    })}
                    {lockedList.map((e, i) => {
                        return <LockedItem {...e} key={e.blockId} />
                    })}
                </div>
            ) : (
                <NoData />
            )}
        </div>
    )
}
