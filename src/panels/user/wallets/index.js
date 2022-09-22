import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { useGetNodeWallet } from '@tangle-pay/store/common'
import { Nav, SvgIcon, Toast } from '@/common'

export const UserWallets = () => {
    const [, walletsList] = useGetNodeWallet()
    return (
        <div className='page'>
            <Nav title={I18n.t('user.manageWallets')} />
            <div className='page-content ph16 pb20'>
                {walletsList.map((e) => {
                    const curNode = IotaSDK.nodes.find((d) => d.id == e.nodeId) || {}
                    return (
                        <div
                            className='flex ac jsb row border radius10 ph16 pv12 mt16 press'
                            style={{
                                borderColor: '#000'
                            }}
                            onClick={() => {
                                Base.push('/user/editWallet', { id: e.id })
                            }}
                            key={e.id}>
                            <div className='flex1'>
                                <div className='flex row ac jsb mr16'>
                                    <div className='fz18 fw600'>{e.name}</div>
                                    <div className='fz16'>{curNode?.type == 2 ? 'EVM' : curNode?.name}</div>
                                </div>
                                <div className='mt5 flex row ae'>
                                    <div className='fz16' style={{ minWidth: '85px' }}>
                                        {Base.handleAddress(e.address)}
                                    </div>
                                    <CopyToClipboard
                                        text={e.address}
                                        onCopy={() => Toast.success(I18n.t('assets.copied'))}>
                                        <SvgIcon
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                e.preventDefault()
                                            }}
                                            name='copy'
                                            size={16}
                                            className='cB press'
                                        />
                                    </CopyToClipboard>
                                </div>
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
