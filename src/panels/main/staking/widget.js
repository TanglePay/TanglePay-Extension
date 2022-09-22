import React, { useEffect, useMemo } from 'react'
import { Button } from 'antd-mobile'
import { SvgIcon, StakingTokenItem, Toast } from '@/common'
import { I18n, Base } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import { useGetNodeWallet } from '@tangle-pay/store/common'
import { useGetParticipationEvents, useGetRewards } from '@tangle-pay/store/staking'
import _get from 'lodash/get'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import advancedFormat from 'dayjs/plugin/advancedFormat'
dayjs.extend(advancedFormat)
dayjs.extend(utc)

const AmountCon = ({ amountList }) => {
    return (
        <div className='ph16 pb24'>
            <div className='fz16 fw600'>{I18n.t('staking.amount')}</div>
            {amountList.map((e, i) => {
                return (
                    <div key={i} className='flex row jsb ac mt12'>
                        <div className='flex row ac'>
                            <StakingTokenItem coin={e.token} label={`${Base.formatNum(e.amount)}Mi`} />
                            <div className='fz16 ml5 cS'>{e.statusStr}</div>
                        </div>
                        {!!e.onPress && (
                            <div>
                                <Button
                                    disabled={e.btnDis}
                                    onClick={e.onPress}
                                    className='border'
                                    color='primary'
                                    size='middle'
                                    style={{
                                        '--border-radius': '20px',
                                        borderColor: e.borderColor,
                                        backgroundColor: '#e2e4e4'
                                    }}>
                                    <div
                                        className='tc fz16 cB fw500'
                                        style={{ minWidth: 70, opacity: e.btnDis ? 0.5 : 1 }}>
                                        {e.btnStr}
                                    </div>
                                </Button>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// Upcoming
const Upcoming = ({ startTime, commenceTime, uncomingTokens, handleStaking }) => {
    const timeStr = dayjs(startTime * 1000)
        .utcOffset(60)
        .format('HH:mm CET, MMM Do YYYY')
    const showPre = dayjs(commenceTime * 1000).isBefore(dayjs())
    return (
        <div className='p16 radius10 bgS'>
            {showPre && (
                <Button size='large' color='primary' block onClick={() => handleStaking(uncomingTokens, 1)}>
                    <div>{I18n.t('staking.preStake')}</div>
                </Button>
            )}
            <div>
                <div className='pv16 fw600 fz16'>{I18n.t('staking.airdrops')}</div>
                <div className='radius10 bgW p15'>
                    <div className='flex c row'>
                        <SvgIcon name='time' size={14} className='cS' />
                        <div className='fz16 fw500 ml5 cS'>{I18n.t('staking.startAt')}</div>
                    </div>
                    <div className='mt10'>
                        <div className='fz23 fw500'>{timeStr}</div>
                    </div>
                </div>
                {uncomingTokens.length > 0 && (
                    <div className='flex row ac mt15' style={{ flexWrap: 'wrap' }}>
                        {uncomingTokens.map((d, di) => {
                            return <StakingTokenItem key={di} className='mr10 mb10' coin={d.token} />
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

// Commencing && unstaking
const UnParticipate = ({ statedTokens, unStakeTokens, handleStaking, uncomingTokens }) => {
    const uList = uncomingTokens.filter((e) => !statedTokens.find((d) => d.eventId === e.eventId))
    return (
        <div className='ph16 radius10 bgS'>
            <Button size='large' color='primary' block onClick={() => handleStaking([...unStakeTokens, ...uList], 1)}>
                <div>{I18n.t('staking.stake')}</div>
            </Button>
            <div>
                <div className='pv16 fw600 fz16'>{I18n.t('staking.airdrops')}</div>
                <div className='flex row ac mb10' style={{ flexWrap: 'wrap' }}>
                    {unStakeTokens.map((d, di) => {
                        return <StakingTokenItem key={di} className='mr10 mb10' coin={d.token} />
                    })}
                    <div className='fz16 cS mb10'>{I18n.t('staking.availableToStake')}</div>
                </div>
                {uList.length > 0 && (
                    <div className='flex row ac mb10' style={{ flexWrap: 'wrap' }}>
                        {uList.map((d, di) => {
                            return <StakingTokenItem key={di} className='mr10 mb10' coin={d.token} />
                        })}
                        <div className='fz16 cS mb10'>{I18n.t('staking.preStake')}</div>
                    </div>
                )}
            </div>
        </div>
    )
}

// Commencing && staked
const Staked = ({ statedTokens, unStakeTokens, uncomingTokens, statedAmount, endedList }) => {
    const handleStake = (tokens) => {
        Base.push('/staking/add', { tokens: JSON.stringify(tokens), amount: statedAmount, type: 4 })
    }
    const stakingTokenList = statedTokens.filter((e) => !endedList.find((d) => d.id === e.eventId))
    const uList = uncomingTokens.filter((e) => !statedTokens.find((d) => d.eventId === e.eventId))
    return (
        <div className='ph16 pb10 radius10 bgS'>
            <div className='fz24 fw600 tc'>{I18n.t('staking.title')}</div>
            <div>
                <div className='pv16 fw600 fz16'>{I18n.t('staking.airdrops')}</div>
                <div className='flex row ae jsb mb10' style={{ flexWrap: 'wrap' }}>
                    <div className='flex flex1 row ac' style={{ flexWrap: 'wrap' }}>
                        {stakingTokenList.map((d, di) => {
                            return <StakingTokenItem className='mr10 mb10' key={di} coin={d.token} />
                        })}
                        <div className='fz16 cS mb10'>{I18n.t('staking.title')}</div>
                    </div>
                </div>
                {unStakeTokens.length > 0 && (
                    <div className='flex row ae jsb mb10' style={{ flexWrap: 'wrap' }}>
                        <div className='flex flex1 row ac' style={{ flexWrap: 'wrap' }}>
                            {unStakeTokens.map((d, di) => {
                                return <StakingTokenItem className='mr10 mb10' key={di} coin={d.token} />
                            })}
                            <div className='fz16 cS mb10'>{I18n.t('staking.available')}</div>
                        </div>
                        <div className='mb5 ml20'>
                            <Button
                                style={{ '--border-radius': '20px' }}
                                color='primary'
                                size='middle'
                                onClick={() => handleStake(unStakeTokens)}>
                                <div className='tc fz16 fw500' style={{ minWidth: 90 }}>
                                    {I18n.t('staking.stake')}
                                </div>
                            </Button>
                        </div>
                    </div>
                )}
                {uList.length > 0 && (
                    <div className='flex row ae jsb mb10' style={{ flexWrap: 'wrap' }}>
                        <div className='flex flex1 row ac' style={{ flexWrap: 'wrap' }}>
                            {uList.map((d, di) => {
                                return <StakingTokenItem key={di} className='mr10 mb10' coin={d.token} />
                            })}
                            <div className='fz16 cS mb10'>{I18n.t('staking.soon')}</div>
                        </div>
                        <div className='mb5 ml20'>
                            <Button
                                style={{ '--border-radius': '20px' }}
                                onClick={() => handleStake(uList)}
                                color='primary'
                                size='middle'>
                                <div className='tc fz16 fw500' style={{ minWidth: 70 }}>
                                    {I18n.t('staking.preStake')}
                                </div>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
// Ended
const Ended = ({ statedTokens, unStakeTokens }) => {
    return (
        <div className='p16 pb10 radius10 bgS'>
            <div className='fw600 fz24 tc'>{` `}</div>
            <div>
                <div className='pv16 fw600 fz16'>{I18n.t('staking.airdrops')}</div>
                <div className='flex row ac jsb mb10'>
                    <div className='flex row ac' style={{ flexWrap: 'wrap' }}>
                        {[...statedTokens, ...unStakeTokens].map((d, di) => {
                            return <StakingTokenItem className='mr10 mb10' key={di} coin={d.token} />
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
export const StatusCon = () => {
    const [{ filter, rewards }] = useStore('staking.config')
    //status: 0->Ended  1->Upcoming ，2->Commencing
    // const [eventInfo, setEventInfo] = useGetParticipationEvents()
    useGetParticipationEvents()
    const [eventInfo, setEventInfo] = useStore('staking.participationEvents')
    let { status = 0, list = [], upcomingList = [], commencingList = [], endedList = [] } = eventInfo
    let [statedTokens] = useStore('staking.statedTokens')
    const [statedAmount] = useStore('staking.statedAmount')
    const [assetsList] = useStore('common.assetsList')
    const assets = assetsList.find((e) => e.name === 'IOTA') || {}
    if (statedTokens.length > 0) {
        status = 3
    }
    list = list.filter((e) => !filter.includes(e.id))
    const startTime = upcomingList[upcomingList.length - 1]?.startTime
    const commenceTime = upcomingList[upcomingList.length - 1]?.commenceTime
    useEffect(() => {
        let timeHandle = null
        if (eventInfo.status === 1) {
            timeHandle = setInterval(() => {
                if (startTime <= new Date().getTime() / 1000) {
                    setEventInfo({ ...eventInfo, status: 2 })
                }
            }, 5000)
        }
        return () => {
            timeHandle && clearInterval(timeHandle)
        }
    }, [startTime, eventInfo])
    let unStakeTokens = []
    const uncomingTokens = upcomingList
        .map((e) => {
            const token = e.payload.symbol
            let unit = _get(rewards, `${token}.unit`) || token
            return {
                token: unit,
                eventId: e.id,
                status: 'uncoming',
                limit: e.limit
            }
        })
        .filter((e) => !!e.token)
    statedTokens = statedTokens
        .map((e) => {
            const token = e.token
            let unit = _get(rewards, `${token}.unit`) || token
            return { ...e, token: unit, status: endedList.find((a) => a.id === e.eventId) ? 'ended' : '' }
        })
        .filter((e) => !!e.token)
    list.forEach((e) => {
        const token = e.payload.symbol
        const tokenInfo = statedTokens.find((d) => d.eventId === e.id)
        const commencingInfo = commencingList.find((a) => a.id === e.id)
        if (!tokenInfo && commencingInfo) {
            let unit = _get(rewards, `${token}.unit`) || token
            unStakeTokens.push({
                token: unit,
                eventId: e.id,
                status: 'unstake',
                limit: e.limit
            })
        }
    })
    unStakeTokens = unStakeTokens.filter((e) => !!e.token)
    let available = parseFloat(assets.balance - statedAmount) || 0
    if (available < 0) {
        available = 0
    }

    const handleStaking = (tokens, type) => {
        if (available < 1 && type != 3) {
            return Toast.error(I18n.t('staking.noAvailableTips'))
        }
        Base.push('/staking/add', { tokens: JSON.stringify(tokens), type })
    }
    const handleUnstake = () => {
        Base.push('/staking/add', { tokens: JSON.stringify(statedTokens), type: 3 })
    }

    let AirdropsItem = [Ended, Upcoming, UnParticipate, Staked][eventInfo.status || 0]

    const unEndedStakeTokens = statedTokens.filter((e) => e.status !== 'ended')
    if (unStakeTokens.length === 0 && eventInfo.status == 2 && status == 3) {
        AirdropsItem = Staked
    }

    let amountList = [
        {
            token: 'IOTA',
            amount: available,
            statusStr: I18n.t('staking.available'),
            borderColor: '#d0d1d2',
            btnDis:
                eventInfo.status == 0 || unEndedStakeTokens.length == 0 || dayjs(commenceTime * 1000).isAfter(dayjs()) // end
        }
    ]
    if (status === 3) {
        amountList[0].btnStr = I18n.t('staking.add')
        amountList[0].onPress = () => {
            handleStaking(unEndedStakeTokens, 2)
        }
        amountList.push({
            token: 'IOTA',
            btnDis: statedAmount <= 0,
            amount: statedAmount,
            statusStr: I18n.t('staking.staked'),
            btnStr: I18n.t('staking.unstake'),
            onPress: handleUnstake,
            borderColor: '#e2e4e4'
        })
    }

    const handleHis = () => {
        Base.push('/staking/history')
    }
    return (
        <>
            <div className='radius10 bgS mb24'>
                <div className='flex row je'>
                    <div className='flex row ac p15'>
                        <div className='fz16 mr10'>{I18n.t('staking.his')}</div>
                        <SvgIcon onClick={handleHis} name='history' className='press' size={20} />
                    </div>
                </div>
                <AirdropsItem
                    uncomingTokens={uncomingTokens}
                    statedTokens={statedTokens}
                    handleStaking={handleStaking}
                    unStakeTokens={unStakeTokens}
                    startTime={startTime}
                    statedAmount={statedAmount}
                    commenceTime={commenceTime}
                    endedList={endedList}
                />
                <AmountCon amountList={amountList} />
            </div>
            <RewardsList endedList={endedList} />
        </>
    )
}

export const RewardsList = ({ endedList }) => {
    const [curWallet] = useGetNodeWallet()
    const [statedTokens] = useStore('staking.statedTokens')
    const [curStatedRewards] = useStore('staking.curStatedRewards')
    useGetRewards(curWallet)
    const [{ rewards }] = useStore('staking.config')
    const list = []
    statedTokens
        .filter((d) => !endedList.find((e) => e.id === d.eventId))
        .forEach((e) => {
            const { token, eventId } = e
            const ratio = _get(rewards, `${token}.ratio`) || 0
            let unit = _get(rewards, `${token}.unit`) || token
            const stakedRewardItem = curStatedRewards[eventId] || {}
            if (stakedRewardItem.amount > 0) {
                let total = _get(curStatedRewards, `${eventId}.amount`) * ratio || 0
                // 1 = 1000m = 1000000u
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
                list.push({
                    token,
                    label: `${Base.formatNum(total)}${preUnit} ${unit}`
                })
            }
        })
    const ListEl = useMemo(() => {
        return list.map((e, i) => {
            return <StakingTokenItem key={i} className='mr10 mb10' coin={e.token} label={e.label} />
        })
    }, [JSON.stringify(list)])
    if (list.length <= 0) {
        return null
    }
    return (
        <div className='mt24'>
            <div className='fz18 cS'>{I18n.t('staking.estimatedReceived')}</div>
            <div className='flex row pt10' style={{ flexWrap: 'wrap' }}>
                {ListEl}
            </div>
        </div>
    )
}

export const AirdopsList = () => {
    const [{ airdrops }] = useStore('staking.config')
    const ListEl = useMemo(() => {
        return airdrops.map((e, i) => {
            return (
                <div
                    className='press mb10 bgS flex row jsb ac p10'
                    key={i}
                    style={{ borderRadius: 8 }}
                    onClick={() => {
                        Base.push(e.link, { title: e.token })
                    }}>
                    <div className='flex row ac'>
                        <img className='mr10' style={{ width: 24, height: 24 }} src={Base.getIcon(e.token)} />
                        <div className='fz16'>{e.desc}</div>
                    </div>
                    <SvgIcon name='right' size={14} />
                </div>
            )
        })
    }, [JSON.stringify(airdrops)])
    if (airdrops.length === 0) {
        return null
    }
    return (
        <div className='mt12'>
            <div className='fz18 mb10 cS'>{I18n.t('staking.airdropsList')}</div>
            {ListEl}
        </div>
    )
}
