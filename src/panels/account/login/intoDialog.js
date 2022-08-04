import React, { useState, useImperativeHandle } from 'react'
import { Mask } from 'antd-mobile'
import { I18n, Base, IotaSDK } from '@tangle-pay/common'
import { Toast } from '@/common'
import { useStore } from '@tangle-pay/store'
export const IntoDialog = ({ dialogRef }) => {
    const [curNodeId] = useStore('common.curNodeId')
    const curNode = IotaSDK.nodes.find((e) => e.id == curNodeId) || {}
    const [isShow, setShow] = useState(false)
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
        setShow(true)
    }
    const hide = () => {
        setShow(false)
    }
    return (
        <Mask className='m0' opacity={0.3} onMaskClick={hide} visible={isShow}>
            <div className='p24 w100 bgS' style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
                <div className='fz18 fw600 tc'>{I18n.t('account.intoBtn')}</div>
                <div className='mt24 bgW radius10'>
                    <div
                        className='pl24 flex ac press'
                        style={{ height: 70 }}
                        onClick={() => {
                            hide()
                            Base.push('/account/into', { type: 1 })
                        }}>
                        <div className='fz17'>{I18n.t('account.intoTitle1')}</div>
                    </div>
                    {curNode?.type == 1 && (
                        <div
                            className='pl24 flex ac press border-t'
                            style={{ height: 70 }}
                            onClick={() => {
                                hide()
                                Toast.show(I18n.t('account.unopen'))
                                // Base.push('/account/into', { type: 2 });
                            }}>
                            <div className='fz17'>{I18n.t('account.intoTitle2')}</div>
                        </div>
                    )}
                    {curNode?.type == 2 && (
                        <div
                            className='pl24 flex ac press border-t'
                            style={{ height: 70 }}
                            onClick={() => {
                                hide()
                                Base.push('/account/into/privateKey')
                            }}>
                            <div className='fz17'>{I18n.t('account.privateKeyImport')}</div>
                        </div>
                    )}
                </div>
            </div>
        </Mask>
    )
}
