import React, { useState, useImperativeHandle } from 'react'
import { Mask, Loading } from 'antd-mobile'
import { Toast } from '@/common'
import { useChangeNode } from '@tangle-pay/store/common'
import { I18n, Base, IotaSDK } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'

export const AddDialog = ({ dialogRef, nodeId }) => {
    const [isShow, setShow] = useState(false)
    const [isShowNode, setShowNode] = useState(true)
    const [curNodeId] = useStore('common.curNodeId')
    const curNode = IotaSDK.nodes.find((e) => e.id == curNodeId) || {}
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
        if (nodeId) {
            setShowNode(false)
            changeNode(parseInt(nodeId))
        } else {
            setShowNode(true)
        }
        setShow(true)
    }
    const hide = () => {
        setShow(false)
    }
    return (
        <Mask className='m0' opacity={0.3} onMaskClick={hide} visible={isShow}>
            <div className='ph16 pb16 w100 radius10 bgS'>
                <div className='flex c pt24 pv16'>
                    <div className='fz18 fw600'>{I18n.t('assets.addWallets')}</div>
                </div>
                {isShowNode ? (
                    <>
                        <div className='fz16 cS mb16'>{I18n.t('account.selectNode')}</div>
                        <div className='bgW radius10'>
                            {IotaSDK.nodes.map((e, i) => {
                                return (
                                    <div
                                        key={e.id}
                                        onClick={async () => {
                                            await changeNode(e.id)
                                            setShowNode(false)
                                        }}
                                        style={{ height: 72 }}
                                        className={`pv24 pl24 flex ac press ${i !== 0 ? 'border-t' : ''}`}>
                                        <div className='fz18'>{e.name}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                ) : (
                    <>
                        <div className='bgW radius10'>
                            <div
                                onClick={() => {
                                    hide()
                                    Base.push('/account/register')
                                }}
                                style={{ height: 72 }}
                                className='pv24 flex c press'>
                                <div className='fz18'>{I18n.t('account.createTitle')}</div>
                            </div>
                            {curNode?.type == 3 && (
                                <div
                                    onClick={() => {
                                        hide()
                                        Base.push('/assets/claimReward')
                                        // Toast.show(I18n.t('account.unopen'))
                                    }}
                                    className='pv24 border-t flex c press'>
                                    <div className='fz18'>{I18n.t('shimmer.claimStakingReward')}</div>
                                </div>
                            )}
                        </div>
                        <div className='fz16 cS mv16'>{I18n.t('account.intoBtn')}</div>
                        <div className='bgW radius10'>
                            <div
                                onClick={() => {
                                    hide()
                                    Base.push('/account/into', { type: 1 })
                                }}
                                style={{ height: 72 }}
                                className='pv24 flex c press'>
                                <div className='fz18'>{I18n.t('account.intoTitle1')}</div>
                            </div>
                            {(curNode?.type == 1 || curNode?.type == 3) && (
                                <div
                                    onClick={() => {
                                        // hide()
                                        Toast.show(I18n.t('account.unopen'))
                                        // Base.push('/account/into', { type: 2 });
                                    }}
                                    className='pv24 flex c border-t press'>
                                    <div className='fz18'>{I18n.t('account.intoTitle2')}</div>
                                </div>
                            )}
                            {curNode?.type == 2 && (
                                <div
                                    onClick={() => {
                                        hide()
                                        Base.push('/account/into/privateKey')
                                    }}
                                    style={{ height: 72 }}
                                    className='pv24 flex c border-t press'>
                                    <div className='fz18'>{I18n.t('account.privateKeyImport')}</div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Mask>
    )
}
