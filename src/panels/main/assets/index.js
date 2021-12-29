import React, { useState } from 'react'
import { PullToRefresh, Loading } from 'antd-mobile'
import { Base, I18n } from '@tangle-pay/common'
import { AssetsNav, SvgIcon } from '@/common'
import { useStore } from '@tangle-pay/store'
import { CoinList, ActivityList } from './list'
import { useGetNodeWallet, useGetAssetsList, useGetLegal } from '@tangle-pay/store/common'

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
            <AssetsNav />
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
                            <SvgIcon
                                name={isShowAssets ? 'eye_1' : 'eye_0'}
                                size={24}
                                className='m15 press cW'
                                onClick={() => setShowAssets(!isShowAssets)}
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
