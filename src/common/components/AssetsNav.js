import React from 'react'
import { NavBar } from 'antd-mobile'
import { Base, I18n } from '@tangle-pay/common'
import { useGetNodeWallet } from '@tangle-pay/store/common'
import { SvgIcon } from '../assets'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Toast } from './Toast'

export const AssetsNav = () => {
    const [curWallet] = useGetNodeWallet()
    return (
        <NavBar
            backArrow={
                <div className='flex row ac pl5'>
                    <div
                        onClick={() => {
                            Base.push('/assets/wallets')
                        }}
                        className='flex row ac ph10 press'
                        style={{ background: '#1D70F7', borderRadius: 20, height: '30px', lineHeight: '30px' }}>
                        <div className='ellipsis fz16 cW' style={{ maxWidth: 120 }}>
                            {curWallet.name || I18n.t('assets.addWallets')}
                        </div>
                        <SvgIcon className='ml10' name='right' color='white' size='13' />
                    </div>
                    {curWallet.address && (
                        <CopyToClipboard
                            text={curWallet.address}
                            onCopy={() => Toast.success(I18n.t('assets.copied'))}
                            className='cS fz14 ml10'>
                            <span>{Base.handleAddress(curWallet.address)}</span>
                        </CopyToClipboard>
                    )}
                </div>
            }
        />
    )
}
