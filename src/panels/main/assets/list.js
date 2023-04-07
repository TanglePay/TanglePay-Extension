import React, { useEffect, useState, useMemo } from 'react'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { Loading, ImageViewer } from 'antd-mobile'
import { useStore } from '@tangle-pay/store'
import { useGetLegal, useGetNodeWallet } from '@tangle-pay/store/common'
import { SvgIcon } from '@/common'
import dayjs from 'dayjs'
import _get from 'lodash/get'
import { useGetNftList } from '@tangle-pay/store/nft'

const itemH = 64
export const CoinList = () => {
    const [isShowAssets] = useStore('common.showAssets')
    const [needRestake] = useStore('staking.needRestake')
    const [statedAmount] = useStore('staking.statedAmount')
    let [assetsList] = useStore('common.assetsList')
    const [curWallet] = useGetNodeWallet()
    const [unlockConditions] = useStore('common.unlockConditions')
    // const curLegal = useGetLegal()
    const contractList = IotaSDK.curNode?.contractList || []
    // assetsList = assetsList.filter((e) => {
    //     const { name } = e
    //     if (!e.contract) {
    //         return true
    //     }
    //     const contract = contractList.find((e) => e.token === name)?.contract
    //     return IotaSDK.contracAssetsShowDic[contract] || e.realBalance > 0
    // })
    const isSMRNode = IotaSDK.checkSMR(IotaSDK.curNode?.id)
    const isLedger = curWallet.type == 'ledger'
    return (
        <div>
            {assetsList.map((e) => {
                const isSMR = isSMRNode && !e.isSMRToken
                return (
                    <div
                        key={`${e.name}_${e.tokenId}_${e.contract}`}
                        style={{ height: itemH }}
                        className='flex row ac press pr'>
                        <div
                            onClick={() => {
                                if (e.isSMRToken) {
                                    Base.push('assets/tokenDetail', {
                                        tokenId: e.tokenId,
                                        standard: e.standard,
                                        name: e.name,
                                        logoUrl: e.logoUrl
                                    })
                                } else {
                                    const func = isLedger ? 'openInTab' : 'push'
                                    Base[func]('assets/send', {
                                        currency: e.name,
                                        id: e.tokenId || e.contract || ''
                                    })
                                }
                            }}>
                            <img
                                className='mr10 border pa bgW'
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 48,
                                    left: 0,
                                    opacity: 1,
                                    top: 8,
                                    zIndex: 0
                                }}
                                src={e.logoUrl || Base.getIcon(e.isSMRToken ? e.tokenId : e.name)}
                                alt=''
                                onError={(e) => {
                                    e.target.style.opacity = 0
                                }}
                            />
                            <div
                                className='mr10 border bgP flex c cW fw600 fz24'
                                style={{ width: 48, height: 48, borderRadius: 48 }}>
                                {String(e.name).toLocaleUpperCase()[0]}
                            </div>
                        </div>
                        <div
                            onClick={() => {
                                const func = isLedger ? 'openInTab' : 'push'
                                Base[func]('assets/send', {
                                    currency: e.name,
                                    id: e.tokenId || e.contract || ''
                                })
                            }}
                            style={{ height: itemH }}
                            className='border-b flex flex1 row ac jsb'>
                            <div className='flex ac row'>
                                <div className='fz18 mr5'>{String(e.name).toLocaleUpperCase()}</div>
                                {!IotaSDK.isWeb3Node &&
                                statedAmount &&
                                e.realBalance > 0 &&
                                statedAmount > 0 &&
                                !needRestake ? (
                                    <div
                                        style={{
                                            transform: 'scale(0.7)',
                                            borderColor: '#4A4A4D',
                                            padding: '1px 4px',
                                            color: '#4A4A4D',
                                            borderRadius: 4
                                        }}
                                        className='fz12 border cS'>
                                        {I18n.t('staking.title')}
                                    </div>
                                ) : null}
                            </div>
                            {isShowAssets ? (
                                <div>
                                    <div className='fz16 tr mb8'>
                                        {e.balance} {String(e.unit || e.name).toLocaleUpperCase()}
                                    </div>
                                    {isSMR ? (
                                        <div className='fz14 tr cS'>
                                            {I18n.t('staking.available')} {e.available}{' '}
                                            {/* {String(e.unit || e.name).toLocaleUpperCase()} */}
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                <div>
                                    <div className='fz16 tr mb8'>****</div>
                                    {isSMR ? (
                                        <div className='fz14 tr cS'>{I18n.t('staking.available')} ****</div>
                                    ) : null}
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
    const [checkClaim] = useStore('common.checkClaim')
    useEffect(() => {
        const obj = {}
        const hasSMR = !!IotaSDK.nodes.find((e) => e.bech32HRP === 'smr')
        for (const i in stakedRewards) {
            const item = stakedRewards[i]
            if (item.amount > 0 && item.minimumReached) {
                const symbol = item.symbol
                obj[symbol] = obj[symbol] || {
                    ...item,
                    amount: 0,
                    isSMR: hasSMR && symbol.includes('SMR')
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
        let arr = Object.values(obj)
        arr.sort((a) => (a.isSMR ? -1 : 0))
        // if (checkClaim) {
        arr = arr.filter((e) => !e.isSMR)
        // }
        setList(arr)
    }, [checkClaim, JSON.stringify(stakedRewards), JSON.stringify(rewards), curWallet.address + curWallet.nodeId])
    const ListEl = useMemo(() => {
        return list.map((e) => {
            return (
                <div
                    onClick={() => {
                        if (e.isSMR) {
                            Base.push('/assets/claimReward/claimSMR', {
                                id: curWallet.id
                            })
                        }
                    }}
                    key={e.symbol}
                    className={`flex row ac ${e.isSMR ? 'press' : ''}`}
                    style={{ height: itemH }}>
                    <img
                        className='mr10 border'
                        style={{ width: 48, height: 48, borderRadius: 48, opacity: !e.isSMR ? 0.4 : 1 }}
                        src={Base.getIcon(e.symbol)}
                    />
                    <div
                        className='flex flex1 row ac jsb border-b'
                        style={{ height: itemH, color: e.isSMR ? '' : 'rgba(0,0,0,0.4)' }}>
                        <div className='fz16'>{e.unit}</div>
                        {isShowAssets ? (
                            <div>
                                <div className='fz16 tr'>{e.amountLabel}</div>
                            </div>
                        ) : (
                            <div>
                                <div className='fz16 tr'>****</div>
                            </div>
                        )}
                    </div>
                </div>
            )
        })
    }, [JSON.stringify(list), isShowAssets])
    return list.length <= 0 ? null : ListEl
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
            const isOutto = [1, 3, 6, 8].includes(e.type)
            const isStake = [2, 3].includes(e.type)
            const isSign = e.type == 4
            const isNft = [7, 8].includes(e.type)
            return (
                <div
                    key={e.id + i}
                    className={`flex row as mv10 ${e.viewUrl ? 'press' : ''}`}
                    onClick={() => {
                        e.viewUrl && Base.push(e.viewUrl)
                    }}>
                    <SvgIcon className='mr20' name={isOutto ? 'outto' : 'into'} size={36} />
                    <div className='border-b flex flex1 row ac jsb pb15'>
                        <div>
                            {isSign ? (
                                <div className='fz17 mb5'>TanglePay.Sign</div>
                            ) : isStake ? (
                                <div className='fz17 mb5'>{I18n.t(isOutto ? 'staking.unstake' : 'staking.stake')}</div>
                            ) : (
                                <div className='fz17 mb5'>
                                    {isOutto ? 'To' : 'From'} :{' '}
                                    {(e.address || '').replace(/(^.{4})(.+)(.{4}$)/, '$1...$3')}
                                </div>
                            )}

                            <div className='fz15 cS'>{dayjs(e.timestamp * 1000).format('YYYY-MM-DD HH:mm')}</div>
                        </div>
                        {!isStake ? (
                            <>
                                {isShowAssets ? (
                                    <div>
                                        <div className='fz15 tr mb5 ellipsis' style={{ maxWidth: 125 }}>
                                            {isOutto ? '-' : '+'} {!isNft ? `${e.num} ` : ''}
                                            {e.coin}
                                        </div>
                                        <div className='fz15 tr cS'>$ {e.assets}</div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className='fz15 tr mb5'>****</div>
                                        <div className='fz15 tr cS'>****</div>
                                    </div>
                                )}
                            </>
                        ) : null}
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

const imgW = (375 - 20 * 2 - 16 * 2) / 3
const CollectiblesItem = ({ logo, name, link, list }) => {
    const [isOpen, setOpen] = useState(false)
    const images = list.map((e) => {
        return e.imageType === 'mp4' ? e.thumbnailImage : e.media
    })
    const isSMRNode = IotaSDK.checkSMR(IotaSDK.curNode?.id)
    return (
        <div>
            <div
                className='press flex row ac'
                onClick={() => {
                    setOpen(!isOpen)
                }}
                style={{ height: 64 }}>
                <SvgIcon size={14} name='up' style={!isOpen && { transform: 'rotate(180deg)' }} />
                <img
                    style={{ width: 32, height: 32, borderRadius: 4 }}
                    className='mr10 ml15'
                    src={Base.getIcon(logo)}
                />
                <div>{name}</div>
                <div className='bgS ml10 ph5' style={{ paddingTop: 3, paddingBottom: 3, borderRadius: 4 }}>
                    <div className='fz12'>{list.length}</div>
                </div>
            </div>
            {isOpen &&
                (list.length > 0 ? (
                    <div className='flex row ac border-b' style={{ flexWrap: 'wrap' }}>
                        {list.map((e, i) => {
                            return (
                                <div style={{ borderRadius: 8 }} className='mb15 pr' key={`${e.uid}_${i}`}>
                                    <div
                                        className='pa flex as jsb'
                                        style={{
                                            width: imgW,
                                            height: 30,
                                            left: parseInt(i % 3) == 1 ? 16 : 0,
                                            top: 0,
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            borderTopLeftRadius: 8,
                                            borderTopRightRadius: 8
                                            // justifyContent: 'flex-end'
                                        }}>
                                        <SvgIcon
                                            onClick={(e) => {
                                                ImageViewer.Multi.show({
                                                    images,
                                                    defaultIndex: i
                                                })
                                                e.stopPropagation()
                                                e.preventDefault()
                                            }}
                                            className='press ml4 mt4'
                                            name='eye_1'
                                            color='white'
                                            size='20'
                                        />
                                        {isSMRNode && e.nftId ? (
                                            <SvgIcon
                                                onClick={(d) => {
                                                    if (isSMRNode && e.nftId) {
                                                        Base.push('assets/send', {
                                                            nftId: e.nftId,
                                                            currency: e.name,
                                                            nftImg: e.thumbnailImage || e.media
                                                        })
                                                        d.stopPropagation()
                                                        d.preventDefault()
                                                    }
                                                }}
                                                className='press mr4 mt4'
                                                name='send'
                                                color='white'
                                                size='18'
                                            />
                                        ) : null}
                                    </div>
                                    <img
                                        onClick={() => {
                                            Base.push('assets/nftDetail', {
                                                nft: JSON.stringify(e)
                                            })
                                        }}
                                        className='bgS'
                                        style={{
                                            borderRadius: 8,
                                            width: imgW,
                                            height: imgW,
                                            marginLeft: parseInt(i % 3) == 1 ? 16 : 0,
                                            marginRight: parseInt(i % 3) == 1 ? 16 : 0,
                                            objectFit: 'contain'
                                        }}
                                        src={e.thumbnailImage || e.media}
                                    />
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className='flex c pb25 pt10 border-b'>
                        <div className='fz15 cS'>
                            {I18n.t('nft.zeroTips').replace('{name}', name)}{' '}
                            <span
                                className='cP press'
                                onClick={() => {
                                    Base.push(link)
                                }}>
                                {I18n.t('nft.goBuy')}
                            </span>
                        </div>
                    </div>
                ))}
        </div>
    )
}
export const CollectiblesList = () => {
    const [isRequestNft] = useStore('nft.isRequestNft')
    useGetNftList()
    const [list] = useStore('nft.list')
    const ListEl = useMemo(() => {
        return list.map((e) => {
            return <CollectiblesItem key={e.space} {...e} />
        })
    }, [JSON.stringify(list)])
    return (
        <div>
            {ListEl}
            {!isRequestNft && (
                <div className='p30 flex c row'>
                    <Loading color='gray' />
                    <span className='flex cS fz16 pl10'>{I18n.t('assets.requestAssets')}</span>
                </div>
            )}
        </div>
    )
}
