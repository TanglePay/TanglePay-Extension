import React, { useEffect, useRef, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { NameDialog } from './nameDialog'
import { useGetNodeWallet } from '@tangle-pay/store/common'
import { Nav, SvgIcon, Toast } from '@/common'

export const UserEditWallet = () => {
    // let params = useLocation()
    const [contentW, setContentW] = useState(375)
    // const [isOpenRemove, setOpenRemove] = useState(false)
    const [curEdit] = useGetNodeWallet()
    const name = curEdit.name || ''
    const dialogRef = useRef()
    // const removeWallet = useRemoveWallet()
    useEffect(() => {
        setContentW(document.getElementById('app').offsetWidth)
    }, [])
    const curNode = IotaSDK.nodes.find((d) => d.id == curEdit.nodeId)
    return (
        <div>
            <Nav title={I18n.t('user.manage')} />
            <div>
                <div className='flex row ac ph16 pv20 border-b border-box'>
                    <div className='flex c mr16 bgP' style={{ width: 40, height: 40, borderRadius: 40 }}>
                        <div className='cW fz18'>{name[0] || ''}</div>
                    </div>
                    <div className='flex1'>
                        <div className='flex ac row mb10'>
                            <div className='fz16 mr10 cB fw600'>{name}</div>
                            <SvgIcon
                                className='cB press'
                                onClick={() => {
                                    dialogRef.current.show()
                                }}
                                size={16}
                                name='edit'
                            />
                        </div>
                        <div className='flex ac row'>
                            <div style={{ width: contentW - 100 }}>
                                <div className='fz16 cS' style={{ wordWrap: 'break-word', lineHeight: '20px' }}>
                                    {curEdit.address}
                                    <CopyToClipboard
                                        text={curEdit.address}
                                        onCopy={() => Toast.success(I18n.t('assets.copied'))}>
                                        <SvgIcon
                                            style={{ display: 'inline-block', verticalAlign: 'middle' }}
                                            wrapper='span'
                                            name='copy'
                                            size={16}
                                            className='cB press ml10'
                                        />
                                    </CopyToClipboard>
                                </div>
                            </div>
                        </div>
                        {/* <div className='flex row ac mt10'>
                            <div
                                className='radius10'
                                style={{ width: 10, height: 10, backgroundColor: '#4E9B45' }}></div>
                            <div className='fz16 ml5'>{IotaSDK.nodes.find((e) => e.id == curEdit.nodeId)?.name}</div>
                        </div> */}
                    </div>
                </div>
                {curNode?.type == 1 ? (
                    <div
                        onClick={() => {
                            Base.push('/user/walletDetail')
                        }}
                        className='press ph16 pv20 flex row jsb ac border-b'>
                        <div className='fz16'>{I18n.t('account.walletDetail')}</div>
                        <SvgIcon name='right' size={15} className='cB' />
                    </div>
                ) : null}
                <div
                    onClick={() => {
                        Base.push('/user/walletPassword', {
                            ...curEdit
                        })
                    }}
                    className='press ph16 pv20 flex row jsb ac border-b'>
                    <div className='fz16'>{I18n.t('user.resetPassword')}</div>
                    <SvgIcon name='right' size={15} className='cB' />
                </div>
                {curNode?.type == 2 && (
                    <div
                        onClick={() => {
                            Base.push('/user/privateKey', {
                                ...curEdit
                            })
                        }}
                        className='press ph16 pv20 flex row jsb ac border-b'>
                        <div className='fz16'>{I18n.t('account.exportKey')}</div>
                        <SvgIcon name='right' size={15} className='cB' />
                    </div>
                )}
                <div
                    onClick={() => {
                        // setOpenRemove(true)
                        Base.push('/user/removeWallet', { id: curEdit.id })
                    }}
                    className='press ph16 pv20 flex row jsb ac border-b'>
                    <div className='fz16'>{I18n.t('account.removeTitle')}</div>
                    <SvgIcon name='right' size={15} className='cB' />
                </div>
            </div>
            <NameDialog dialogRef={dialogRef} data={{ ...curEdit }} />
            {/* {isOpenRemove && (
                <Mask
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    visible={isOpenRemove}
                    onMaskClick={() => setOpenRemove(false)}
                    opacity={0.5}>
                    <div
                        className='bgW'
                        style={{
                            borderRadius: 16,
                            marginLeft: 8,
                            marginRight: 8
                        }}>
                        <div className='flex ac jsb border-b pl15 pr10 pv5'>
                            <div className='fz16 fw600'>{I18n.t('account.removeTitle')}</div>
                            <SvgIcon
                                onClick={() => setOpenRemove(false)}
                                name='close'
                                style={{ marginTop: 3 }}
                                color='black'
                                size='22'
                            />
                        </div>
                        <div className='ph15 border-b'>
                            <div className='flex ac border mt20 p5' style={{ borderRadius: 8 }}>
                                <div className='flex1'>
                                    <div className='fz14 cS'>{I18n.t('account.removeName')}</div>
                                    <div className='fz14 fw600 mt5'>{name}</div>
                                </div>
                                <div className='flex1'>
                                    <div className='fz14 cS'>{I18n.t('account.removeAddress')}</div>
                                    <div className='fz14 fw600 mt5'>{Base.handleAddress(curEdit.address)}</div>
                                </div>
                            </div>
                            <div
                                className='cS fz14 pv10'
                                style={{ lineHeight: '18px' }}
                                dangerouslySetInnerHTML={{
                                    __html: I18n.t('account.removeTips').replace(/\n/g, '<br/>')
                                }}></div>
                        </div>
                        <div className='flex row ac jsb p15'>
                            <Button
                                onClick={() => {
                                    setOpenRemove(false)
                                }}
                                fill='outline'
                                className='flex1 mr20'
                                style={{ '--border-radius': '8px', height: 34, fontSize: 14 }}
                                size='small'
                                color='primary'>
                                {I18n.t('account.nevermind')}
                            </Button>
                            <Button
                                className='flex1 bgS'
                                onClick={() => {
                                    setOpenRemove(false)
                                    removeWallet(id)
                                    Base.goBack()
                                }}
                                style={{
                                    '--border-radius': '8px',
                                    backgroundColor: '#D53554',
                                    borderColor: '#D53554',
                                    height: 34,
                                    fontSize: 14
                                }}
                                size='small'
                                color='primary'>
                                {I18n.t('account.remove')}
                            </Button>
                        </div>
                    </div>
                </Mask>
            )} */}
        </div>
    )
}
