import React, { useState, useEffect } from 'react'
import { AssetsNav } from '@/common'
import { Loading } from 'antd-mobile'
import { StatusCon, AirdopsList, RewardsList } from './widget'
import { useGetEventsConfig } from '@tangle-pay/store/staking'
import { useStore } from '@tangle-pay/store'
export const Staking = () => {
    const [height, setHeight] = useState(0)
    useGetEventsConfig()
    const [isRequestStakeHis] = useStore('common.isRequestStakeHis')
    useEffect(() => {
        const height = document.body.offsetHeight - 64 - 51
        setHeight(height)
    }, [])
    return (
        <div className='h100'>
            <AssetsNav />
            <div className='ph20' style={{ height, overflowY: 'scroll' }}>
                <StatusCon />
                <RewardsList />
                <AirdopsList />
            </div>
            {!isRequestStakeHis && (
                <div className='w100 h100 flex c pa' style={{ left: 0, top: 0 }}>
                    <Loading />
                </div>
            )}
        </div>
    )
}
