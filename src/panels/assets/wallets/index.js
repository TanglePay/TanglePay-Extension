import React, { useEffect, useRef, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Base, Nav, I18n, images, Toast, NoData } from '@/common'
import { AddDialog } from './addDialog'
import { useSelectWallet, useGetNodeWallet } from '@/store/common'
const contentH = document.body.offsetHeight
export const AssetsWallets = () => {
    const dialogRef = useRef()
    const selectWallet = useSelectWallet()
    const [, walletsList] = useGetNodeWallet()
    const [curActive, setActive] = useState('')
    useEffect(() => {
        const id = (walletsList.find((e) => e.isSelected) || {}).id
        setActive(id || '')
    }, [walletsList])
    return (
        <div className='page mask-content-je'>
            <Nav title={I18n.t('assets.myWallets')} />
            <div>
                <div style={{ overflowY: 'scroll', height: contentH - 64 - 60 }} className='ph20'>
                    {walletsList.length > 0 ? (
                        <div className='mb20'>
                            {walletsList.map((e) => {
                                const isActive = curActive === e.id
                                return (
                                    <div
                                        onClick={() => {
                                            if (curActive === e.id) {
                                                Base.goBack()
                                                return
                                            }
                                            setActive(e.id)
                                            Toast.showLoading()
                                            setTimeout(() => {
                                                selectWallet(e.id)
                                            }, 20)
                                            Base.goBack()
                                            setTimeout(() => {
                                                Toast.hideLoading()
                                            }, 100)
                                        }}
                                        key={e.id}
                                        className={`press radius10 ph20 pv15 mt20`}
                                        style={isActive ? { background: '#1D70F7' } : { border: '1px solid #000' }}>
                                        <div className={`fz17 ${isActive && 'cW'}`}>{e.name}</div>
                                        <div className='mt20 row ae flex'>
                                            <div className={`fz15 ${isActive && 'cW'}`}>
                                                {Base.handleAddress(e.address)}
                                            </div>
                                            <CopyToClipboard
                                                text={e.address}
                                                onCopy={() => {
                                                    Toast.success(I18n.t('assets.copied'))
                                                }}>
                                                <img
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        e.preventDefault()
                                                    }}
                                                    className='ml30 press'
                                                    style={{ width: 20, height: 20 }}
                                                    src={isActive ? images.com.copy1 : images.com.copy}
                                                    alt=''
                                                />
                                            </CopyToClipboard>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className='mt60'>
                            <NoData />
                        </div>
                    )}
                </div>
                <div
                    className='border-t press flex c'
                    style={{ height: 60 }}
                    onClick={() => {
                        dialogRef.current.show()
                    }}>
                    <div className='fz17'>+　{I18n.t('assets.addWallets')}</div>
                </div>
            </div>
            <AddDialog dialogRef={dialogRef} />
        </div>
    )
}
