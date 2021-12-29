import React, { useState } from 'react'
import { StakingTokenItem, SvgIcon } from '@/common'
import { I18n } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import dayjs from 'dayjs'
const dotBgDic = {
    1: '#FCB11D',
    2: '#13BD00',
    3: '#D0D1D2',
    4: '#3671EE'
}
const Title = ({ type }) => {
    const bg = dotBgDic[type]
    const labelDic = {
        1: 'staking.stake',
        2: 'staking.addAmount',
        3: 'staking.unstake',
        4: 'staking.addAirdrop'
    }
    return (
        <div className='flex row ac'>
            <div
                className='radius10 mr5'
                style={{ backgroundColor: bg, width: 8, height: 8, borderRadius: '50%' }}></div>
            <div className='fz16 fw500'>{I18n.t(labelDic[type])}</div>
        </div>
    )
}
const Item = (props) => {
    const [isShow, setShow] = useState(false)
    const { type, amount, time, tokens } = props
    const token1 = tokens.slice(0, 3)
    const token2 = tokens.slice(3)
    return (
        <div className='ph25 pt25' style={{ opacity: type == 3 ? 0.5 : 1 }}>
            <div className='flex row ac jsb mb15'>
                <Title type={type} />
                <div className='fz12'>{dayjs(time * 1000).format('MM.DD.YYYY HH:mm:ss')}</div>
            </div>
            <div className='flex row ac jsb mb15'>
                <div className='fz12 cS ml20'>{I18n.t('staking.amount')}</div>
                <div className='fz14 cB'>{amount} Mi</div>
            </div>
            <div className='flex row ac jsb mb10'>
                <div className='fz12 cS ml20'>{I18n.t('staking.token')}</div>
                <div className='flex row ac'>
                    {token1.map((e, i) => {
                        return <StakingTokenItem key={i} coin={e.token} className='ml5' />
                    })}
                </div>
            </div>
            {token2.length > 0 && !isShow && (
                <div className='flex row je'>
                    <div className='flex row ac pb10 press' onClick={() => setShow(!isShow)}>
                        <div className='pr5 fz12 cP'>View all</div>
                        <SvgIcon name='down' size={10} className='cP' />
                    </div>
                </div>
            )}
            {isShow && (
                <div className='flex row ac je'>
                    <div className='flex row ac'>
                        {token2.map((e, i) => {
                            return <StakingTokenItem key={i} coin={e.token} className='ml5 mb10' />
                        })}
                    </div>
                </div>
            )}
            <div className='pt15' style={{ height: 1, borderBottom: '1px dotted #D8D8D8' }}></div>
        </div>
    )
}

export const List = () => {
    const [list] = useStore('staking.historyList')
    const newList = [...list]
    newList.reverse()
    return (
        <div>
            {newList.map((e, i) => {
                return (
                    <div key={i}>
                        <Item {...e} />
                    </div>
                )
            })}
        </div>
    )
}
