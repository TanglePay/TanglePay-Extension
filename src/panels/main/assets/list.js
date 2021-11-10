import React, { useEffect, useState } from 'react'
import { Base, images, I18n } from '@/common'
import { Loading } from 'antd-mobile'
import { useStore } from '@/store'
import { useGetLegal } from '@/store/common'
import dayjs from 'dayjs'

export const CoinList = () => {
    const [isShowAssets] = useStore('common.showAssets')
    const [assetsList] = useStore('common.assetsList')
    const curLegal = useGetLegal()
    const [isRequestAssets] = useStore('common.isRequestAssets')
    return (
        <div>
            {assetsList.map((e) => {
                return (
                    <div
                        onClick={() => {
                            Base.push('assets/send')
                        }}
                        key={e.name}
                        className='flex row as mb10 press'>
                        <img className='mr25' style={{ width: 35, height: 35, borderRadius: 35 }} src={e.icon} alt='' />
                        <div className='border-b flex flex1 row ac jsb pb10'>
                            <div className='fz17'>{e.name}</div>
                            {isShowAssets ? (
                                <div>
                                    <div className='fz15 tr mb5'>
                                        {e.balance} {e.unit}
                                    </div>
                                    <div className='fz15 tr cS'>
                                        {curLegal.unit} {e.assets}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className='fz15 tr mb5'>****</div>
                                    <div className='fz15 tr cS'>****</div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
            {!isRequestAssets && (
                <div className='p30 flex c row'>
                    <Loading color='gray' />
                    <span className='flex cS fz16 pl10'>{I18n.t('assets.requestAssets')}</span>
                </div>
            )}
        </div>
    )
}
export const ActivityList = ({ search }) => {
    const [list] = useStore('common.hisList')
    const [height, setHeight] = useState(0)
    const [isShowAssets] = useStore('common.showAssets')
    const [isRequestHis] = useStore('common.isRequestHis')
    useEffect(() => {
        const dom = document.getElementById('activity-id')
        const height = document.body.offsetHeight - dom.offsetTop - 51
        setHeight(height)
    }, [])
    const showList = list.filter((e) => !search || e.address.toLocaleUpperCase().includes(search.toLocaleUpperCase()))
    console.log(showList, '======')
    return (
        <div id='activity-id' style={{ height, overflowY: 'scroll' }}>
            {showList.map((e) => {
                return (
                    <div key={e.id} className='flex row as mb20'>
                        <img
                            className='mr25'
                            style={{ width: 25, height: 32.4 }}
                            src={e.type === 1 ? images.com.outto : images.com.into}
                            alt=''
                        />
                        <div className='border-b flex flex1 row ac jsb pb15'>
                            <div>
                                <div className='fz17 mb5'>
                                    {e.type === 1 ? 'To' : 'From'} :{' '}
                                    {e.address.replace(/(^.{4})(.+)(.{4}$)/, '$1...$3')}
                                </div>
                                <div className='fz15 cS'>{dayjs(e.timestamp * 1000).format('YYYY-MM-DD HH:mm')}</div>
                            </div>
                            {isShowAssets ? (
                                <div>
                                    <div className='fz15 tr mb5'>
                                        {e.type === 1 ? '-' : '+'} {e.num} {e.coin}
                                    </div>
                                    <div className='fz15 tr cS'>$ {e.assets}</div>
                                </div>
                            ) : (
                                <div>
                                    <div className='fz15 tr mb5'>****</div>
                                    <div className='fz15 tr cS'>****</div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
            {!isRequestHis && (
                <div className='p30 flex c row'>
                    <Loading color='gray' />
                    <span className='flex cS fz16 pl10'>{I18n.t('assets.requestHis')}</span>
                </div>
            )}
        </div>
    )
}
