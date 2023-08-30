import React, { useState } from 'react'
import { NavBar, Mask } from 'antd-mobile'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { useGetNodeWallet, useChangeNode } from '@tangle-pay/store/common'
import { SvgIcon } from '../assets'
import { useStore } from '@tangle-pay/store'

export const AssetsNav = ({ hasChangeNode }) => {
    const [curWallet] = useGetNodeWallet()
    const [polyganSupport] = useStore('common.polyganSupport')
    const nodeId = curWallet?.nodeId
    const curNode = IotaSDK.nodes.find((e) => e.id == nodeId) || {}
    const isWeb3 = IotaSDK.checkWeb3Node(nodeId)
    const web3Nodes = IotaSDK.nodes.filter((e) => IotaSDK.checkWeb3Node(e.id))
    let nodeList = [...web3Nodes]
    if (polyganSupport != 1) {
        nodeList = web3Nodes.filter((e) => e.id != 8)
    }
    const [isOpenChange, setOpenChange] = useState(false)
    const [isOpenMore, setOpenMore] = useState(false)
    const changeNode = useChangeNode()
    return (
        <>
            <NavBar
                className='assets-nav'
                backArrow={
                    <div className='flex row ac'>
                        <div
                            onClick={() => {
                                Base.push('/assets/wallets')
                            }}
                            className='wallet-name-con flex row ac ph10 press'
                            style={{ background: '#1D70F7', borderRadius: 24, height: '32px', lineHeight: '32px' }}>
                            <div className='wallet-name ellipsis fz16 fw600 cW'>{curWallet.name || I18n.t('assets.addWallets')}</div>
                            {curWallet.address && (
                                // <CopyToClipboard
                                //     text={curWallet.address}
                                //     onCopy={() => Toast.success(I18n.t('assets.copied'))}
                                //     className='cW fz14 ml5'>
                                //     <span>{Base.handleAddress(curWallet.address)}</span>
                                // </CopyToClipboard>
                                <div style={{ marginBottom: -1 }} className='cW fz14 ml5 fw300'>
                                    {Base.handleAddress(curWallet.address)}
                                </div>
                            )}
                            <SvgIcon style={{ marginBottom: 2 }} className='ml10' name='right' color='white' size='12' />
                        </div>
                        {isWeb3 && hasChangeNode && (
                            <div
                                onClick={() => setOpenChange(!isOpenChange)}
                                className='network-con ml10 border ph10 flex row ac press bgW'
                                style={{ borderRadius: 24, height: '32px', lineHeight: '32px' }}>
                                <div
                                    className='mr8'
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        background: '#5BB3AE'
                                    }}></div>
                                <div className='ellipsis fz14 fw500 mr10'>{curNode?.name}</div>
                                <SvgIcon
                                    style={{
                                        // marginBottom: isOpenChange ? -2 : 2,
                                        // transform: isOpenChange ? 'rotate(180deg)' : ''
                                        marginBottom: -2,
                                        transform: 'rotate(180deg)'
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
                    curWallet.address && (
                        <div className='flex ac je'>
                            <SvgIcon
                                onClick={() => {
                                    setOpenMore(!isOpenMore)
                                }}
                                className='press'
                                name='more'
                                color='black'
                                size='30'
                            />
                        </div>
                    )
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
                            EVM {I18n.t('user.network')}
                        </div>
                        {nodeList.map((e) => {
                            return (
                                <div
                                    key={e.id}
                                    className='flex ac row pl15 press'
                                    onClick={() => {
                                        setOpenChange(false)
                                        changeNode(e.id)
                                    }}
                                    style={{ height: 44, minWidth: 260 }}>
                                    <div style={{ width: 30 }}>{nodeId == e.id && <SvgIcon name='tick' style={{ marginTop: 3 }} color='#5BB3AE' size='18' />}</div>
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
                            top: 56,
                            right: 16,
                            boxShadow: '-10px 24px 48px rgba(0, 0, 0, 0.24)',
                            borderRadius: 8
                        }}>
                        <div
                            onClick={() => {
                                Base.push(`${curNode.explorer}/${IotaSDK.checkWeb3Node(curWallet.nodeId) ? 'address' : 'addr'}/${curWallet.address}`)
                            }}
                            className='flex ac ph15 press'
                            style={{ height: 48, minWidth: 260 }}>
                            <SvgIcon name='view' style={{ marginTop: 3 }} color='black' size='18' />
                            <div className='ml10 fz16 fw600'>{I18n.t('account.viewInExplorer')}</div>
                        </div>
                    </div>
                </Mask>
            )}
        </>
    )
}
