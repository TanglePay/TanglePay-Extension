import React from 'react'
import { I18n } from '@tangle-pay/common'
import { List } from './list'
import { Nav } from '@/common'

export const StakingHistory = () => {
    return (
        <div className='h100'>
            <Nav title={I18n.t('staking.his')} />
            <div className='page-content' style={{ overflow: 'scroll' }}>
                <List />
            </div>
        </div>
    )
}
