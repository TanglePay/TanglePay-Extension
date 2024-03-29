import React, { useState, useEffect } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Toast } from '@/common'
import { Base, I18n } from '@tangle-pay/common'

const Item = ({ id, icon, desc, developer, url, curAddress }) => {
    const hasTips = id === 'Simplex' && curAddress
    const El = (
        <div
            className='press flex row ac pt8'
            onClick={() => {
                if (!hasTips) {
                    Base.push(url, { title: id })
                }
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
    if (hasTips) {
        return (
            <CopyToClipboard
                text={curAddress}
                onCopy={() => {
                    if (curAddress) {
                        Toast.success(I18n.t('discover.addressCopy'))
                        setTimeout(() => {
                            Base.push(url)
                        }, 2000)
                    } else {
                        Base.push(url)
                    }
                }}>
                {El}
            </CopyToClipboard>
        )
    }
    return El
}

export const List = ({ list, height, curWallet }) => {
    return (
        <div id='apps-id' style={{ height, overflowY: 'scroll' }}>
            {list.map((e) => {
                return <Item key={e.id} {...e} curAddress={curWallet?.address} />
            })}
        </div>
    )
}
