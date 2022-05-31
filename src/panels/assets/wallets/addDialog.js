import React, { useState, useImperativeHandle } from 'react'
import { Mask, Loading } from 'antd-mobile'
import { Toast } from '@/common'
import { useChangeNode } from '@tangle-pay/store/common'
import { I18n, Base, IotaSDK } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'

export const AddDialog = ({ dialogRef }) => {
    const [isShow, setShow] = useState(false)
    const [isShowNode, setShowNode] = useState(true)
    const changeNode = useChangeNode()
    useImperativeHandle(
        dialogRef,
        () => {
            return {
                show
            }
        },
        []
    )
    const show = () => {
        setShowNode(true)
        setShow(true)
    }
    const hide = () => {
        setShow(false)
    }
    return (
        <Mask className='m0' opacity={0.3} onMaskClick={hide} visible={isShow}>
            <div className='ph20 pb50 w100 radius10 bgS'>
                <div className='flex c pv15'>
                    <div className='fz16 cS'>{I18n.t('assets.addWallets')}</div>
                </div>
                {isShowNode ? (
                    <>
                        <div className='fz16 cS mt20 mb10'>{I18n.t('account.selectNode')}</div>
                        <div className='bgW radius10'>
                            {IotaSDK.nodes.map((e, i) => {
                                return (
                                    <div
                                        key={e.id}
                                        onClick={async () => {
                                            await changeNode(e.id)
                                            setShowNode(false)
                                        }}
                                        className={`pv30 pl30 flex ac press ${i !== 0 ? 'border-t' : ''}`}>
                                        <div className='fz18'>{e.name}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                ) : (
                    <>
                        <div
                            onClick={() => {
                                hide()
                                Base.push('/account/register')
                            }}
                            className='pv30 flex c bgW radius10 press'>
                            <div className='fz18'>{I18n.t('account.createTitle')}</div>
                        </div>
                        <div className='fz16 cS mt20 mb10'>{I18n.t('account.intoBtn')}</div>
                        <div className='bgW radius10'>
                            <div
                                onClick={() => {
                                    hide()
                                    Base.push('/account/into', { type: 1 })
                                }}
                                className='pv30 flex c press'>
                                <div className='fz18'>{I18n.t('account.intoTitle1')}</div>
                            </div>
                            <div
                                onClick={() => {
                                    hide()
                                    Toast.show(I18n.t('account.unopen'))
                                    // Base.push('/account/into', { type: 2 });
                                }}
                                className='pv30 flex c border-t press'>
                                <div className='fz18'>{I18n.t('account.intoTitle2')}</div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Mask>
    )
}
