import React from 'react'
import { Base } from '@tangle-pay/common'

export const StakingTokenItem = ({ coin, label, className = '' }) => {
    return (
        <div className={`flex row ac border bgW ${className}`} style={{ borderRadius: 20 }}>
            <img style={{ width: 24, height: 24 }} src={Base.getIcon(coin)} />
            <div className='fz12 mh5'>{label || coin}</div>
        </div>
    )
}
