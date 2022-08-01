import React, { useEffect, useRef, useState } from 'react'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { useGetNodeWallet, useChangeNode } from '@tangle-pay/store/common'
import { Nav, NoData, SvgIcon, Toast } from '@/common'

const contentH = document.body.offsetHeight
export const ClaimReward = () => {
    let [, walletsList] = useGetNodeWallet()
    const changeNode = useChangeNode()
    const [curActive, setActive] = useState('')
    walletsList = walletsList.filter((e) => e.nodeId == 1)
    useEffect(() => {
        const id = (walletsList.find((e) => e.isSelected) || {}).id
        setActive(id || '')
    }, [walletsList])
    return (
        <div className='page mask-content-je'>
            <Nav title={I18n.t('assets.myWallets')} />
            <div>
                <div style={{ overflowY: 'scroll', height: contentH - 48 - 60 }} className='ph20'>
                    <div className='fz17 pt16'>
                        Choose a Wallet to <span className='cP'>Claim SMR Staking Rewards</span>
                    </div>
                    {walletsList.length > 0 ? (
                        <div className='mb16'>
                            {walletsList.map((e) => {
                                return (
                                    <div
                                        onClick={() => {
                                            Base.push('/assets/claimReward/claimSMR', {
                                                id: e.id
                                            })
                                        }}
                                        key={e.id}
                                        className={`press radius8 p16 mt16`}
                                        style={{ border: '1px solid #000' }}>
                                        <div className='flex row ac jsb'>
                                            <div className='fz18 fw600'>{e.name}</div>
                                            <div className='fz16 cS'>{Base.handleAddress(e.address)}</div>
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
                    <div className='fz17'>
                        如果你要Claim收益的IOTA钱包不在列表内，请先在Tanglepay中{' '}
                        <span
                            className='press cP'
                            onClick={async () => {
                                await changeNode(IotaSDK.IOTA_NODE_ID)
                                Base.push('/account/into', { type: 1, from: 'smr' })
                            }}>
                            导入IOTA钱包
                        </span>
                    </div>
                </div>
                {/* <div className='border-t press flex c p16' style={{ height: 60 }}>
                    <div className='fz17'>
                        如果你要Claim收益的IOTA钱包不在列表内，请先在Tanglepay中{' '}
                        <span
                            className='press cP fw600'
                            onClick={async () => {
                                await changeNode(IotaSDK.IOTA_NODE_ID)
                                Base.push('/account/into', { type: 1, from: 'smr' })
                            }}>
                            导入IOTA钱包
                        </span>
                    </div>
                </div> */}
            </div>
        </div>
    )
}
