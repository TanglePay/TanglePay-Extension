import React, { useState } from 'react'
import { NavBar, PullToRefresh, Loading } from 'antd-mobile'
import { Base, Toast, images, I18n } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import { CoinList, ActivityList } from './list'
import { useGetNodeWallet, useGetAssetsList, useGetLegal } from '@tangle-pay/store/common'
import { CopyToClipboard } from 'react-copy-to-clipboard'

export const Assets = () => {
    const [isRequestAssets] = useStore('common.isRequestAssets')
    const [isRequestHis] = useStore('common.isRequestHis')
    const [isShowAssets, setShowAssets] = useStore('common.showAssets')
    const [, refreshAssets] = useStore('common.forceRequest')
    const [curWallet] = useGetNodeWallet()
    // const [search, setSearch] = useState('')
    const [curTab, setTab] = useState(0)
    useGetAssetsList(curWallet)
    const [totalAssets] = useStore('common.totalAssets')
    const curLegal = useGetLegal()
    const checkPush = (path) => {
        if (!curWallet.address) {
            Base.push('/account/register')
            return
        }
        Base.push(path)
    }
    return (
        <div className='h100'>
            <NavBar
                backArrow={
                    <div className='flex row ac pl10'>
                        <div
                            onClick={() => {
                                Base.push('/assets/wallets')
                            }}
                            className='flex row ac ph10 pv5 press'
                            style={{ background: '#1D70F7', borderRadius: 20 }}>
                            <div className='ellipsis fz16 cW' style={{ maxWidth: 120 }}>
                                {curWallet.name || I18n.t('assets.addWallets')}
                            </div>
                            <img className='ml10' style={{ width: 14, height: 14 }} src={images.com.right_w} alt='' />
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
            <PullToRefresh
                renderText={() => <Loading />}
                onRefresh={() => {
                    if (isRequestAssets && isRequestHis) {
                        refreshAssets(Math.random())
                    }
                }}>
                <div className='ph20'>
                    <div className='pt20 mt5' style={{ background: '#1D70F7', borderRadius: 10, overflow: 'hidden' }}>
                        <div className='flex ph20 row ac'>
                            <div className='fz16 cW'>
                                {I18n.t('assets.myAssets')}({curLegal.unit || ''})
                            </div>
                            <img
                                onClick={() => setShowAssets(!isShowAssets)}
                                style={{ width: 16, height: 16 }}
                                className='ml5 press'
                                src={isShowAssets ? images.com.eye_1 : images.com.eye_0}
                                alt=''
                            />
                        </div>
                        <div className='ph20 mt20 mb15'>
                            <div className='cW fz20'>{isShowAssets ? totalAssets.assets || '0.00' : '****'}</div>
                        </div>
                        <div className='flex row pv10' style={{ background: '#1F7EFC' }}>
                            <div
                                onClick={() => {
                                    checkPush('assets/send')
                                }}
                                className='flex1 flex c pv5 press'
                                style={{ borderRight: '1px solid #fff' }}>
                                <div className='cW fz17'>{I18n.t('assets.send')}</div>
                            </div>
                            <div
                                onClick={() => {
                                    checkPush('assets/receive')
                                }}
                                className='flex1 flex c pv5 press'>
                                <div className='cW fz17'>{I18n.t('assets.receive')}</div>
                            </div>
                        </div>
                    </div>
                    <div className='flex row jsb ac mt25 mb10'>
                        <div className='flex row ac'>
                            <div onClick={() => setTab(0)} className='flex c pv20 mr30 press'>
                                <div className={`${curTab === 0 ? 'cP' : 'cS'} fz17`}>{I18n.t('assets.assets')}</div>
                            </div>
                            <div onClick={() => setTab(1)} className='press flex c pv20'>
                                <div className={`${curTab === 1 ? 'cP' : 'cS'} fz17`}>{I18n.t('assets.activity')}</div>
                            </div>
                        </div>
                    </div>
                    <div>{curTab === 0 ? <CoinList /> : <ActivityList />}</div>
                </div>
            </PullToRefresh>
        </div>
    )
}
