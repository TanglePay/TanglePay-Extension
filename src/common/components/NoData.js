import React from 'react'
import { SvgIcon } from '../assets'

export const NoData = ({ label, img, style = {} }) => {
    img = img || 'noData'
    return (
        <div className='w100 p30 flex c' style={{ ...style }}>
            <SvgIcon size={120} name={img} color='#777' />
            {label && <div className='fz15 mt30'>{label}</div>}
        </div>
    )
}
