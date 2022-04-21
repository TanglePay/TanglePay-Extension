import React, { useEffect, useState, useMemo } from 'react'
import { Base, I18n } from '@tangle-pay/common'
import { Loading } from 'antd-mobile'
import { useStore } from '@tangle-pay/store'
import { useGetLegal } from '@tangle-pay/store/common'
import { SvgIcon } from '@/common'
import dayjs from 'dayjs'
import { useGetNodeWallet } from '@tangle-pay/store/common'
import _get from 'lodash/get'

const itemH = 70
export const CoinList = () => {
    const [isShowAssets] = useStore('common.showAssets')
    const [needRestake] = useStore('staking.needRestake')
    const [statedAmount] = useStore('staking.statedAmount')
    const [assetsList] = useStore('common.assetsList')
    const curLegal = useGetLegal()
    return (
        <div>
            {assetsList.map((e) => {
                return (
                    <div
                        onClick={() => {
                            Base.push('assets/send')
                        }}
                        key={e.name}
                        style={{ height: itemH }}
                        className='flex row ac press'>
                        <img
                            className='mr15 border'
                            style={{ width: 35, height: 35, borderRadius: 35 }}
                            src={Base.getIcon(e.name)}
                            alt=''
                        />
                        <div style={{ height: itemH }} className='border-b flex flex1 row ac jsb'>
                            <div className='flex ac row'>
                                <div className='fz17'>{e.name}</div>
                                {statedAmount > 0 && !needRestake && (
                                    <div
                                        style={{
                                            transform: 'scale(0.7)',
                                            borderColor: '#BABABA',
                                            padding: '1px 4px',
                                            borderRadius: 4
                                        }}
                                        className='fz12 border ml10 cS'>
                                        {I18n.t('staking.title')}
                                    </div>
                                )}
                            </div>
                            {isShowAssets ? (
                                <div>
                                    <div className='fz15 tr mb15'>
                                        {e.balance} {e.unit}
                                    </div>
                                    <div className='fz15 tr cS'>
                                        {curLegal.unit} {e.assets}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className='fz15 tr mb15'>****</div>
                                    <div className='fz15 tr cS'>****</div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
export const RewardsList = () => {
    const [isShowAssets] = useStore('common.showAssets')
    const [stakedRewards] = useStore('staking.stakedRewards')
    const [list, setList] = useState([])
    const [curWallet] = useGetNodeWallet()
    const [{ rewards }] = useStore('staking.config')
    const [isRequestAssets] = useStore('common.isRequestAssets')
    useEffect(() => {
        const obj = {}
        for (const i in stakedRewards) {
            const item = stakedRewards[i]
            if (item.address !== curWallet.address) {
                return
            }
            if (item.amount > 0) {
                const symbol = item.symbol
                obj[symbol] = obj[symbol] || {
                    ...item,
                    amount: 0
                }
                obj[symbol].amount += item.amount
                const ratio = _get(rewards, `${symbol}.ratio`) || 0
                let unit = _get(rewards, `${symbol}.unit`) || symbol
                let total = obj[symbol].amount * ratio || 0
                // // 1 = 1000m = 1000000u
                let preUnit = ''
                if (total > 0) {
                    if (total <= Math.pow(10, -5)) {
                        total = Math.pow(10, 6) * total
                        preUnit = 'μ'
                    } else if (total <= Math.pow(10, -2)) {
                        total = Math.pow(10, 3) * total
                        preUnit = 'm'
                    } else if (total >= Math.pow(10, 4)) {
                        total = Math.pow(10, -3) * total
                        preUnit = 'k'
                    }
                }
                obj[symbol].amountLabel = `${Base.formatNum(total)}${preUnit} ${unit}`
                obj[symbol].unit = unit
            }
        }
        setList(Object.values(obj))
    }, [JSON.stringify(stakedRewards), JSON.stringify(rewards), curWallet.address])
    const ListEl = useMemo(() => {
        return list.map((e) => {
            return (
                <div key={e.symbol} className='flex row ac' style={{ opacity: 0.6, height: itemH }}>
                    <img
                        className='mr15 border'
                        style={{ width: 35, height: 35, borderRadius: 35 }}
                        src={Base.getIcon(e.symbol)}
                    />
                    <div className='flex flex1 row ac jsb border-b' style={{ height: itemH }}>
                        <div className='fz17'>{e.unit}</div>
                        {isShowAssets ? (
                            <div>
                                <div className='fz15 tr'>{e.amountLabel}</div>
                            </div>
                        ) : (
                            <div>
                                <div className='fz15 tr'>****</div>
                            </div>
                        )}
                    </div>
                </div>
            )
        })
    }, [JSON.stringify(list), isShowAssets])
    return (
        <>
            {list.length <= 0 ? null : ListEl}
            {!isRequestAssets && (
                <div className='p30 flex c row'>
                    <Loading color='gray' />
                    <span className='flex cS fz16 pl10'>{I18n.t('assets.requestAssets')}</span>
                </div>
            )}
        </>
    )
}
export const ActivityList = ({ search }) => {
    const [list] = useStore('common.hisList')
    const [isShowAssets] = useStore('common.showAssets')
    const [isRequestHis] = useStore('common.isRequestHis')
    const showList = list.filter(
        (e) => !search || (e.address || '').toLocaleUpperCase().includes(search.toLocaleUpperCase())
    )
    const ListEl = useMemo(() => {
        return showList.map((e, i) => {
            const isOutto = [1, 3].includes(e.type)
            const isStake = [2, 3].includes(e.type)
            return (
                <div key={e.id + i} className='flex row as mb20'>
                    <SvgIcon className='mr20' name={isOutto ? 'outto' : 'into'} size={36} />
                    <div className='border-b flex flex1 row ac jsb pb15'>
                        <div>
                            {isStake ? (
                                <div className='fz17 mb5'>{I18n.t(isOutto ? 'staking.unstake' : 'staking.stake')}</div>
                            ) : (
                                <div className='fz17 mb5'>
                                    {isOutto ? 'To' : 'From'} :{' '}
                                    {(e.address || '').replace(/(^.{4})(.+)(.{4}$)/, '$1...$3')}
                                </div>
                            )}

                            <div className='fz15 cS'>{dayjs(e.timestamp * 1000).format('YYYY-MM-DD HH:mm')}</div>
                        </div>
                        {isShowAssets ? (
                            <div>
                                <div className='fz15 tr mb5'>
                                    {isOutto ? '-' : '+'} {e.num} {e.coin}
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
        })
    }, [JSON.stringify(showList), isShowAssets])
    return (
        <div>
            {ListEl}
            {!isRequestHis && (
                <div className='p30 flex c row'>
                    <Loading color='gray' />
                    <span className='flex cS fz16 pl10'>{I18n.t('assets.requestHis')}</span>
                </div>
            )}
        </div>
    )
}
