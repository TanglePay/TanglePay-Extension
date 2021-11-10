import React, { useRef } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Base, Nav, I18n, images, Toast } from '@/common'
import { useLocation } from 'react-router-dom'
import { NameDialog } from './nameDialog'
import { useGetNodeWallet } from '@/store/common'
const contentW = document.body.offsetWidth

export const UserEditWallet = () => {
    let params = useLocation()
    params = Base.handlerParams(params.search)
    const id = params.id
    const [, walletsList] = useGetNodeWallet()
    const curEdit = walletsList.find((e) => e.id === id) || {}
    const name = curEdit.name || ''
    const dialogRef = useRef()
    return (
        <div>
            <Nav title={I18n.t('user.manage')} />
            <div>
                <div className='flex row ac p20 border-b border-box'>
                    <div className='flex c mr15 bgP' style={{ width: 40, height: 40, borderRadius: 40 }}>
                        <div className='cW fz15'>{name[0] || ''}</div>
                    </div>
                    <div className='flex1'>
                        <div className='flex ac row mb10'>
                            <div className='fz15 mr10'>{name}</div>
                            <img
                                className='press'
                                onClick={() => {
                                    dialogRef.current.show()
                                }}
                                style={{ width: 16, height: 16 }}
                                src={images.com.edit}
                                alt=''
                            />
                        </div>
                        <div className='flex ac row'>
                            <div style={{ width: contentW - 100 }}>
                                <div className='fz15 cS' style={{ wordWrap: 'break-word', lineHeight: '20px' }}>
                                    {curEdit.address}
                                    <CopyToClipboard
                                        text={curEdit.address}
                                        onCopy={() => Toast.success(I18n.t('assets.copied'))}>
                                        <img
                                            className='press ml10'
                                            style={{ width: 16, height: 16, verticalAlign: 'middle' }}
                                            src={images.com.copy}
                                            // onClick={(e) => {
                                            //     e.stopPropagation()
                                            //     e.preventDefault()
                                            // }}
                                            alt=''
                                        />
                                    </CopyToClipboard>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    onClick={() => {
                        Base.push('/user/walletPassword', {
                            ...curEdit
                        })
                    }}
                    className='press p20 flex row jsb ac border-b'>
                    <div className='fz15'>{I18n.t('user.resetPassword')}</div>
                    <img style={{ width: 15, height: 15 }} src={images.com.right} alt='' />
                </div>
            </div>
            <NameDialog dialogRef={dialogRef} data={{ ...curEdit }} />
        </div>
    )
}
