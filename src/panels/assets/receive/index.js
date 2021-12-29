import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { I18n, Base } from '@tangle-pay/common'
import { NavBar } from 'antd-mobile'
import { useGetNodeWallet } from '@tangle-pay/store/common'
import { LeftOutline } from 'antd-mobile-icons'
import { SvgIcon, Toast } from '@/common'
// import { ShareDialog } from './shareDialog'
import QRCode from 'qrcode.react'
import { default as scan_bg } from '@tangle-pay/assets/images/scan_bg.png'

export const AssetsReceive = () => {
    const [curWallet] = useGetNodeWallet()
    // const dialogRef = useRef()
    return (
        <div className='page mask-content-je' style={{ backgroundColor: '#1F7EFC' }}>
            <NavBar
                backArrow={
                    <LeftOutline
                        onClick={() => {
                            Base.goBack()
                        }}
                        color='#fff'
                    />
                }>
                <div className='cW'>{I18n.t('assets.receiver')}</div>
            </NavBar>
            <div className='mh20 mt10 radius10 bgW flex column ac'>
                <div className='pv20'>
                    <div className='fz16 cS'>{I18n.t('assets.scanQRcode')}</div>
                </div>
                <div className='border-b w100 flex column ac pb20 border-box'>
                    <div
                        className='flex c'
                        style={{
                            backgroundImage: `url(${scan_bg})`,
                            backgroundSize: '100% 100%',
                            backgroundRepeat: 'no-repeat',
                            width: 220,
                            height: 220
                        }}>
                        {curWallet.address && <QRCode value={curWallet.address} size={200} />}
                    </div>
                </div>
                <div className='pv20 ph50 w100 flex ac column border-box mb10'>
                    <CopyToClipboard text={curWallet.address} onCopy={() => Toast.success(I18n.t('assets.copied'))}>
                        <div
                            className='ph10 pv5 bgS'
                            style={{ borderRadius: 4, maxWidth: '100%', wordWrap: 'break-word' }}>
                            <div className='fz11 tc' style={{ lineHeight: '20px' }}>
                                {curWallet.address}
                                <SvgIcon
                                    style={{ display: 'inline-block', verticalAlign: 'middle' }}
                                    wrapper='span'
                                    name='copy'
                                    size={16}
                                    className='ml10 press cB'
                                />
                            </div>
                        </div>
                    </CopyToClipboard>
                </div>
                {/* <div className='pv30 ph50 w100 border-box'>
                    <div className='flex jsb'>
                        <CopyToClipboard text={curWallet.address} onCopy={() => Toast.success(I18n.t('assets.copied'))}>
                            <div className='press flex ac row'>
                                <img style={{ width: 12.8, height: 14.3 }} src={images.com.copy} />
                                <div className='fz16 pl10 cB'>{I18n.t('assets.copy')}</div>
                            </div>
                        </CopyToClipboard>
                        <div
                            className='press flex ac row'
                            onClick={() => {
                                dialogRef.current.show(curWallet.address)
                            }}>
                            <img style={{ width: 13, height: 13 }} src={images.com.share} />
                            <div className='fz16 pl10 cB'>{I18n.t('assets.share')}</div>
                        </div>
                    </div>
                </div> */}
            </div>
            {/* <ShareDialog dialogRef={dialogRef} /> */}
        </div>
    )
}
