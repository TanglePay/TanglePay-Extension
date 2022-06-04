import React, { useEffect, useRef, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { AddDialog } from './addDialog'
import { useSelectWallet, useGetNodeWallet } from '@tangle-pay/store/common'
import { Nav, NoData, SvgIcon, Toast } from '@/common'
import { useLocation } from 'react-router-dom'

const contentH = document.body.offsetHeight
export const AssetsWallets = () => {
    const dialogRef = useRef()
    const selectWallet = useSelectWallet()
    let [, walletsList] = useGetNodeWallet()
    const [curActive, setActive] = useState('')
    let params = useLocation()
    params = Base.handlerParams(params?.search) || {}
    if (params?.nodeId) {
        walletsList = walletsList.filter((e) => e.nodeId == params.nodeId)
    }
    useEffect(() => {
        const id = (walletsList.find((e) => e.isSelected) || {}).id
        setActive(id || '')
    }, [walletsList])
    return (
        <div className='page mask-content-je'>
            <Nav title={I18n.t('assets.myWallets')} />
            <div>
                <div style={{ overflowY: 'scroll', height: contentH - 64 - 60 }} className='ph20'>
                    {walletsList.length > 0 ? (
                        <div className='mb20'>
                            {walletsList.map((e) => {
                                const isActive = curActive === e.id
                                const curNode = IotaSDK.nodes.find((d) => d.id === e.nodeId) || {}
                                return (
                                    <div
                                        onClick={() => {
                                            if (curActive === e.id) {
                                                Base.goBack()
                                                return
                                            }
                                            setActive(e.id)
                                            // Toast.showLoading()
                                            setTimeout(() => {
                                                selectWallet(e.id)
                                            }, 20)
                                            Base.goBack()
                                            // setTimeout(() => {
                                            //     Toast.hideLoading()
                                            // }, 100)
                                        }}
                                        key={e.id}
                                        className={`press radius10 ph20 pv15 mt20`}
                                        style={isActive ? { background: '#1D70F7' } : { border: '1px solid #000' }}>
                                        <div className='flex row ac jsb'>
                                            <div className={`fz17 ${isActive && 'cW'}`}>{e.name}</div>
                                            <div className={`fz17 ${isActive && 'cW'}`}>
                                                {curNode?.type == 2 ? 'EVM' : curNode?.name}
                                            </div>
                                        </div>

                                        <div className='mt20 row ae flex'>
                                            <div className={`fz15 ${isActive && 'cW'}`}>
                                                {Base.handleAddress(e.address)}
                                            </div>
                                            <CopyToClipboard
                                                text={e.address}
                                                onCopy={() => {
                                                    Toast.success(I18n.t('assets.copied'))
                                                }}>
                                                <SvgIcon
                                                    name='copy'
                                                    size={20}
                                                    className={`ml30 press ${isActive ? 'cW' : 'cB'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        e.preventDefault()
                                                    }}
                                                />
                                            </CopyToClipboard>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className='mt60'>
                            <NoData />
                        </div>
                    )}
                </div>
                <div
                    className='border-t press flex c'
                    style={{ height: 60 }}
                    onClick={() => {
                        dialogRef.current.show()
                    }}>
                    <div className='fz17'>+　{I18n.t('assets.addWallets')}</div>
                </div>
            </div>
            <AddDialog dialogRef={dialogRef} nodeId={params?.nodeId} />
        </div>
    )
}
