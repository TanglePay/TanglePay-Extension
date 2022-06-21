import React, { useState } from 'react'
import { AssetsNav, Nav, SvgIcon, Toast } from '@/common'
import { Button, Input, Mask } from 'antd-mobile'
import { Base, I18n } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import { useCollect, useGetWalletInfo, useGetNodeWallet } from '@tangle-pay/store/common'

const clientWidth = document.body.clientWidth
export const WalletCollection = () => {
    const [, totalInfo, loading, getInfo] = useGetWalletInfo()
    const [curWallet] = useGetNodeWallet()
    const [password, setPassword] = useState('')
    const [isShow, setShow] = useState(false)
    const [list, setList] = useState([])
    const [start, stop] = useCollect()
    let handeNum = list?.length || 0
    const totalNum = totalInfo?.outputIds?.length || 0
    handeNum = handeNum <= totalNum ? handeNum : totalNum
    return (
        <>
            <div>
                <AssetsNav />
                <Nav title='My Wallet 2' />
                <div className='view-content'>
                    <div className='border-b p16'>
                        <div className='border fz12 cS p8' style={{ borderRadius: 8, wordBreak: 'break-all' }}>
                            iota1qzrhx0ey6w4a9x0xg3zxagq2ufrw45qv8nlv24tkpxeetk864a4rkewh7e5
                        </div>
                    </div>
                    <div className='ph16 pv24'>
                        <div className='fz16'>output 归集</div>
                        <div className='flex ac mt10'>
                            <div className='fz14 cS mr24'>待处理 output 条数</div>
                            <div className='fz16 cP fw600'>{totalNum}</div>
                        </div>
                        <div className='fz14 mt24'>{I18n.t('assets.passwordTips')}</div>
                        <Input type='password' value={password} onChange={setPassword} className='border-b pv10' />
                        <Button
                            onClick={() => {
                                if (password !== curWallet.password) {
                                    return Toast.error(I18n.t('assets.passwordError'))
                                }
                                start(curWallet, setList)
                                setShow(true)
                            }}
                            className='mt40 mb16'
                            block
                            color='primary'>
                            output 归集
                        </Button>
                    </div>
                </div>
            </div>
            {isShow ? (
                <Mask
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    visible={isShow}
                    opacity={0.5}>
                    <div
                        className='bgW'
                        style={{
                            borderRadius: 16,
                            marginLeft: 8,
                            marginRight: 8,
                            width: clientWidth - 16
                        }}>
                        <div className='border-b ph16 pv15'>
                            <div className='fz16 fw600'>output 归集</div>
                        </div>
                        <div className='p16 flex ac jsb'>
                            <div className='fz16 cS'>已处理的条数</div>
                            <div className='flex ac'>
                                {handeNum < totalNum ? (
                                    <SvgIcon
                                        style={{
                                            transform: ['scale(0.3)'],
                                            height: 30,
                                            width: 30,
                                            transformOrigin: 'left top'
                                        }}
                                        className='ml5'
                                        name='loading'
                                    />
                                ) : null}
                                <div className='cP fw600 fz16'>
                                    {handeNum} / {totalNum}
                                </div>
                            </div>
                        </div>
                        <div className='p15'>
                            <Button
                                block
                                onClick={async () => {
                                    stop()
                                    setShow(false)
                                    Toast.showLoading()
                                    await getInfo()
                                    Toast.hideLoading()
                                }}
                                color='primary'>
                                终止
                            </Button>
                        </div>
                    </div>
                </Mask>
            ) : null}
        </>
    )
}
