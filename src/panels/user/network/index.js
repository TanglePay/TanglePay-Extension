import React from 'react'
import { Nav, I18n, IotaSDK } from '@tangle-pay/common'
import { useChangeNode } from '@tangle-pay/store/common'
import { useStore } from '@tangle-pay/store'

export const UserNetwork = () => {
    const [curNodeId, , dispatch] = useStore('common.curNodeId')
    const setCurNodeId = useChangeNode(dispatch)
    console.log(curNodeId)
    return (
        <div className='page'>
            <Nav title={I18n.t('user.network')} />
            <div>
                {IotaSDK.nodes.map((e) => {
                    return (
                        <div
                            key={e.id}
                            onClick={() => {
                                setCurNodeId(e.id)
                            }}
                            className='press p20 border-b'>
                            <div className={`fz15 ${curNodeId === e.id ? 'cP' : ''}`}>{e.name}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
