import React, { useState } from 'react'
import { NavBar, Mask } from 'antd-mobile'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { useGetNodeWallet, useChangeNode } from '@tangle-pay/store/common'
import { SvgIcon } from '../assets'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Toast } from './Toast'

export const AssetsNav = ({ hasChangeNode }) => {
    const [curWallet] = useGetNodeWallet()
    const nodeId = curWallet?.nodeId
    const curNode = IotaSDK.nodes.find((e) => e.id == nodeId) || {}
    const isWeb3 = IotaSDK.checkWeb3Node(nodeId)
    const web3Nodes = IotaSDK.nodes.filter((e) => IotaSDK.checkWeb3Node(e.id))
    const [isOpenChange, setOpenChange] = useState(false)
    const [isOpenMore, setOpenMore] = useState(false)
    const changeNode = useChangeNode()
    return (
        <>
            <NavBar
                backArrow={
                    <div className='flex row ac pl5'>
                        <div
                            onClick={() => {
                                Base.push('/assets/wallets')
                            }}
                            className='flex row ac ph10 press'
                            style={{ background: '#1D70F7', borderRadius: 20, height: '28px', lineHeight: '28px' }}>
                            <div className='ellipsis fz14 fw500 cW' style={{ maxWidth: 120 }}>
                                {curWallet.name || I18n.t('assets.addWallets')}
                            </div>
                            {curWallet.address && (
                                // <CopyToClipboard
                                //     text={curWallet.address}
                                //     onCopy={() => Toast.success(I18n.t('assets.copied'))}
                                //     className='cW fz14 ml5'>
                                //     <span>{Base.handleAddress(curWallet.address)}</span>
                                // </CopyToClipboard>
                                <div className='cW fz14 ml5'>
                                    <span>{Base.handleAddress(curWallet.address)}</span>
                                </div>
                            )}
                            <SvgIcon className='ml10' name='right' color='white' size='11' />
                        </div>
                        {isWeb3 && hasChangeNode && (
                            <div
                                onClick={() => setOpenChange(!isOpenChange)}
                                className='ml10 border ph10 flex row ac press'
                                style={{ borderRadius: 20, height: '28px', lineHeight: '28px' }}>
                                <div
                                    style={{ width: 10, height: 10, borderRadius: '50%', background: '#5BB3AE' }}></div>
                                <div className='fz14 fw500 mh10'>{curNode?.name}</div>
                                <SvgIcon
                                    style={{
                                        marginBottom: isOpenChange ? -2 : 2,
                                        transform: isOpenChange ? 'rotate(180deg)' : ''
                                    }}
                                    name='up'
                                    color='black'
                                    size='11'
                                />
                            </div>
                        )}
                    </div>
                }
                right={
                    isWeb3 && hasChangeNode ? (
                        <div>
                            <SvgIcon
                                onClick={() => {
                                    setOpenMore(!isOpenMore)
                                }}
                                className='press'
                                name='more'
                                color='black'
                                size='26'
                            />
                        </div>
                    ) : null
                }
            />
            {isOpenChange && (
                <Mask visible={isOpenChange} onMaskClick={() => setOpenChange(false)} opacity={0}>
                    <div
                        className='pa bgW'
                        style={{
                            top: 58,
                            left: 15,
                            boxShadow: '-10px 24px 48px rgba(0, 0, 0, 0.24)',
                            borderRadius: 8
                        }}>
                        <div className='flex c border-b' style={{ height: 44, minWidth: 260 }}>
                            {I18n.t('user.network')}
                        </div>
                        {web3Nodes.map((e) => {
                            return (
                                <div
                                    key={e.id}
                                    className='flex ac row pl15 press'
                                    onClick={() => {
                                        setOpenChange(false)
                                        changeNode(e.id)
                                    }}
                                    style={{ height: 44, minWidth: 260 }}>
                                    <div style={{ width: 30 }}>
                                        {nodeId == e.id && (
                                            <SvgIcon name='tick' style={{ marginTop: 3 }} color='#5BB3AE' size='18' />
                                        )}
                                    </div>
                                    <div
                                        style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: '50%',
                                            background: '#5BB3AE'
                                        }}></div>
                                    <div className='fz14 fw500 mh10'>{e.name}</div>
                                </div>
                            )
                        })}
                    </div>
                </Mask>
            )}
            {isOpenMore && (
                <Mask visible={isOpenMore} onMaskClick={() => setOpenMore(false)} opacity={0}>
                    <div
                        className='pa bgW'
                        style={{
                            top: 58,
                            right: 15,
                            boxShadow: '-10px 24px 48px rgba(0, 0, 0, 0.24)',
                            borderRadius: 8
                        }}>
                        <div
                            onClick={() => {
                                Base.push(curNode.explorer)
                            }}
                            className='flex ac ph15 press'
                            style={{ height: 44, minWidth: 260 }}>
                            <SvgIcon name='view' style={{ marginTop: 3 }} color='black' size='18' />
                            <div className='ml10 fz14 fw500'>{I18n.t('account.viewInExplorer')}</div>
                        </div>
                    </div>
                </Mask>
            )}
        </>
    )
}
