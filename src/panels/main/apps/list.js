import React, { useState, useEffect } from 'react'
import { Base } from '@tangle-pay/common'

const Item = ({ id, icon, desc, developer, url }) => {
    return (
        <div
            className='press flex row ac pt8'
            onClick={() => {
                Base.push(url, { title: id })
            }}>
            <div className='mr8'>
                <img className='border' style={{ width: 64, height: 64, borderRadius: 16 }} src={Base.getIcon(icon)} />
            </div>
            <div className='border-b'>
                <div className='fz18 mb5'>{id}</div>
                {desc ? (
                    <div
                        style={{ wordBreak: 'break-word', whiteSpace: 'break-spaces' }}
                        className='fz16 cS ellipsis-2 mb5 fw300'>
                        {desc}
                    </div>
                ) : null}
                {developer ? (
                    <div style={{ wordBreak: 'break-word', whiteSpace: 'break-spaces' }} className='fz16 cS mb5 fw300'>
                        {developer}
                    </div>
                ) : null}
            </div>
        </div>
    )
}

export const List = ({ list, height }) => {
    return (
        <div id='apps-id' style={{ height, overflowY: 'scroll' }}>
            {list.map((e) => {
                return <Item key={e.id} {...e} />
            })}
        </div>
    )
}
