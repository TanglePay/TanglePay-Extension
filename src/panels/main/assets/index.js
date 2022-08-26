import React, { useState, useEffect } from 'react'
import { PullToRefresh, Loading } from 'antd-mobile'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { AssetsNav, SvgIcon, Toast } from '@/common'
import { useStore } from '@tangle-pay/store'
import { CoinList, ActivityList, RewardsList, CollectiblesList } from './list'
import { useGetNodeWallet, useGetAssetsList, useGetLegal } from '@tangle-pay/store/common'
import { useGetEventsConfig } from '@tangle-pay/store/staking'
import './index.less'

const initAsssetsTab = ['stake', 'soonaverse', 'contract']
export const Assets = ({ tabKey }) => {
    useGetEventsConfig()
    const [lang] = useStore('common.lang')
    const [assetsTab, setAssetsTab] = useState([])
    const [height, setHeight] = useState(0)
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
    useEffect(() => {
        const dom = document.getElementById('content-id')
        if (dom.offsetTop && tabKey === 'assets') {
            const height = document.body.offsetHeight - dom.offsetTop - 61
            setHeight(height)
        }
    }, [lang, tabKey])
    useEffect(() => {
        let filterAssetsList = IotaSDK.nodes.find((e) => e.id === curWallet.nodeId)?.filterAssetsList || []
        setAssetsTab([...initAsssetsTab.filter((e) => !filterAssetsList.includes(e))])
    }, [curWallet.nodeId])
    return (
        <div className='h100 assets-page'>
            <AssetsNav hasChangeNode />
            <PullToRefresh
                renderText={() => <Loading />}
                onRefresh={async () => {
                    if (curWallet.address) {
                        IotaSDK.inputPassword(curWallet).then((res) => {
                            if (res) {
                                refreshAssets(Math.random())
                            }
                        })
                    }
                }}>
                <div>
                    <div className='ph16'>
                        <div className='mt5' style={{ background: '#1D70F7', borderRadius: 10, overflow: 'hidden' }}>
                            <div className='flex ph16 pt16 pb10 row ac'>
                                <div className='fz16 cW'>
                                    {I18n.t('assets.myAssets')}({curLegal.unit || ''})
                                </div>
                                <SvgIcon
                                    name={isShowAssets ? 'eye_1' : 'eye_0'}
                                    size={24}
                                    className='ml10 press cW'
                                    onClick={() => setShowAssets(!isShowAssets)}
                                />
                            </div>
                            <div className='ph16 mb15'>
                                <div className='cW fz20'>{isShowAssets ? totalAssets.assets || '0.00' : '****'}</div>
                            </div>
                            <div className='flex row pv10' style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
                                <div
                                    onClick={() => {
                                        checkPush('assets/send')
                                    }}
                                    className='flex1 flex c pv5 press'
                                    style={{ borderRight: '1px solid #3671ee' }}>
                                    <div className='cW fz18'>{I18n.t('assets.send')}</div>
                                </div>
                                <div
                                    onClick={() => {
                                        checkPush('assets/receive')
                                    }}
                                    className='flex1 flex c pv5 press'>
                                    <div className='cW fz18'>{I18n.t('assets.receive')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='ph16 flex row jsb ac mt8 border-b'>
                        <div className='w100 flex row ac jsb'>
                            <div className='flex row ac'>
                                <div onClick={() => setTab(0)} className='flex c mr30 press' style={{ height: 60 }}>
                                    <div className={`${curTab === 0 ? 'cP' : 'cB'} fz16`}>
                                        {I18n.t('assets.assets')}
                                    </div>
                                </div>
                                {assetsTab.includes('soonaverse') && (
                                    <div onClick={() => setTab(1)} className='press flex c' style={{ height: 60 }}>
                                        <div className={`${curTab === 1 ? 'cP' : 'cB'} fz16`}>
                                            {I18n.t('nft.collectibles')}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div onClick={() => setTab(2)} className='press flex c' style={{ height: 60 }}>
                                <div className={`${curTab === 2 ? 'cP' : 'cB'} fz16`}>{I18n.t('assets.activity')}</div>
                            </div>
                        </div>
                    </div>
                    <div className='ph16' id='content-id' style={{ height, overflowY: 'scroll' }}>
                        {curTab === 0 ? (
                            <div>
                                <CoinList />
                                {assetsTab.includes('stake') && <RewardsList />}
                            </div>
                        ) : curTab == 1 ? (
                            <CollectiblesList />
                        ) : (
                            <ActivityList />
                        )}
                    </div>
                </div>
            </PullToRefresh>
        </div>
    )
}
