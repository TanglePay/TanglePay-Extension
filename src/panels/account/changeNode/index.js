import React, { useRef } from 'react'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { useChangeNode } from '@tangle-pay/store/common'
import { AddDialog } from '../../assets/wallets/addDialog'
// import { default as logo_nobg } from '@tangle-pay/assets/images/logo_nobg.png'

export const AccountChangeNode = () => {
    const dialogRef = useRef()
    // const changeNode = useChangeNode()
    const list = []
    let evmName = []
    const nodes = JSON.parse(JSON.stringify(IotaSDK.nodes))
    nodes.forEach((e) => {
        if (IotaSDK.checkWeb3Node(e.id)) {
            if (!list.find((d) => d.type == e.type)) {
                list.push({ ...e })
            }
            evmName.push(e.name)
        } else {
            list.push({ ...e })
        }
    })
    const evmData = list.find((e) => IotaSDK.checkWeb3Node(e.id))
    if (evmData) {
        evmName = evmName.filter(name  => ['BSC', 'Polygon', 'ETH', 'Shimmer EVM'].map(chain => chain.toLocaleLowerCase()).includes(name.toLocaleLowerCase()))
        evmData.name = `EVM (${evmName.join(' / ')})`
    }
    return (
        <div className='page flex column mask-content-je'>
            <div className='flex jsb column flex1'>
                <div className='ph20 flex1 flex jc column mt30'>
                    {/* <img className='mb15' style={{ width: 129.6, height: 135 }} src={logo_nobg} /> */}
                    <div className='mb24 tc'>
                        {I18n.t('account.dearFam')
                            .split('##')
                            .filter((e) => !!e)
                            .map((e, i) => {
                                return (
                                    <span key={i} className={`fw600 ${i == 0 ? 'cP' : ''}`} style={{ fontSize: 32 }}>
                                        {e}
                                    </span>
                                )
                            })}
                    </div>
                    <div
                        className='fz16 tc'
                        style={{ lineHeight: '19px' }}
                        dangerouslySetInnerHTML={{
                            __html: I18n.t('account.betaReady').replace(/\n/g, '<br/>')
                        }}></div>
                </div>
                <div
                    className='p20'
                    style={{ backgroundColor: '#1F7EFC', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
                    <div className='fz16 cW'>{I18n.t('account.changeTips')}</div>
                    <div className='mt20 bgW' style={{ borderRadius: 16, maxHeight: 240, overflow: 'scroll' }}>
                        {list.map((e, i) => {
                            return (
                                <div
                                    key={e.id}
                                    style={{ height: 60 }}
                                    className={`press flex ac pl24 ${i != 0 && 'border-t'}`}
                                    onClick={async () => {
                                        // await changeNode(e.id)
                                        dialogRef.current.show(e.id)
                                        // Base.push('/account/login')
                                    }}>
                                    <div className='fz18 fw500'>{e.name}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            <AddDialog dialogRef={dialogRef} />
        </div>
    )
}
