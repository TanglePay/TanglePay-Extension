import React, { useEffect, useState } from 'react'
import { NavBar, Mask } from 'antd-mobile'
import { Base, I18n, API_URL } from '@tangle-pay/common'
import { useGetNodeWallet } from '@tangle-pay/store/common'
import { SvgIcon } from '@/common/assets'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Toast } from '@/common'

export const Discover = () => {
    const [curWallet] = useGetNodeWallet()
    const [switchConfig, setSwichConfig] = useState({})
    useEffect(() => {
        fetch(`${API_URL}/switchConfig.json?v=${new Date().getTime()}`)
            .then((res) => res.json())
            .then((res) => {
                setSwichConfig(res)
            })
    }, [])
    return (
        <div className='h100'>
            <NavBar backArrow={null}>{I18n.t('discover.title')} </NavBar>
            <>
                <div
                    onClick={() => {
                        Base.push('/stake/index')
                    }}
                    style={{ height: 58 }}
                    className='bgW press flex ac row jsb p16 border-t border-b'>
                    <div className='flex ac'>
                        <SvgIcon style={{ marginBottom: -2 }} className='mr16' name='stake' color='#3671EE' size='22' />
                        <div className='fz16 fw500'>{I18n.t('staking.title')}</div>
                    </div>
                    <SvgIcon style={{ marginBottom: -2 }} name='right' color='#333' size='13' />
                </div>
                {switchConfig.buyIota == 1 ? (
                    <CopyToClipboard
                        text={curWallet.address}
                        onCopy={() => {
                            const url = 'https://tanglepay.com/simplex.html?crypto=MIOTA'
                            // const url = 'https://tanglepay.com/simplex-staging.html?crypto=MIOTA'
                            if (curWallet.address) {
                                Toast.success(I18n.t('discover.addressCopy'))
                                setTimeout(() => {
                                    Base.push(url)
                                }, 2000)
                            } else {
                                Base.push(url)
                            }
                        }}>
                        <div style={{ height: 58 }} className='bgW press flex ac row jsb p16 border-b'>
                            <div className='flex ac'>
                                <SvgIcon
                                    style={{ marginBottom: -2 }}
                                    className='mr16'
                                    name='buy'
                                    color='#3671EE'
                                    size='20'
                                />
                                <div className='fz16 fw500'>{I18n.t('discover.buyIota')}</div>
                            </div>
                            <SvgIcon style={{ marginBottom: -2 }} name='right' color='#333' size='13' />
                        </div>
                    </CopyToClipboard>
                ) : null}
            </>
        </div>
    )
}
