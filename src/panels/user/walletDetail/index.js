import React from 'react'
import { AssetsNav, Nav, SvgIcon } from '@/common'
import { Button } from 'antd-mobile'
import numeral from 'numeral'

const list = [
    {
        address: 'iota1qzrhx0ey6w4a9x0xg3zxagq2ufrw45qv8nlv24tkpxeetk864a4rkewh7e5',
        outputs: '100',
        balance: 30010
    },
    {
        address: 'iota1qzrhx0ey6w4a9x0xg3zxagq2ufrw45qv8nlv24tkpxeetk864a4rkewh7e5',
        outputs: '100',
        balance: 30010
    },
    {
        address: 'iota1qzrhx0ey6w4a9x0xg3zxagq2ufrw45qv8nlv24tkpxeetk864a4rkewh7e5',
        outputs: '100',
        balance: 30010
    }
]
export const WalletDetail = () => {
    return (
        <div>
            <AssetsNav />
            <Nav title='My Wallet 2' />
            <div className='view-content ph16'>
                <div className='flex ac jsb' style={{ height: 60 }}>
                    <div className='fz16'>该seed下的地址</div>
                    <Button
                        size='small'
                        className='flex ac line-h0'
                        style={{
                            '--border-radius': '24px'
                        }}
                        color='primary'>
                        <span>导出Excel</span>
                        <SvgIcon className='ml5' name='excel' color='white' size='14' />
                    </Button>
                </div>
                <div className='pt8'>
                    <div style={{ height: 26 }} className='flex ac jsb mb8 fz14'>
                        <div className='flex1'>地址</div>
                        <div className='flex1 tr'>Output数</div>
                        <div className='flex1 tr'>金额 MIOTA</div>
                    </div>
                    {list.map((e, i) => {
                        return (
                            <div key={i} style={{ height: 26 }} className='flex ac jsb mb8 fz14'>
                                <div className='flex1'>
                                    {(e.address || '').replace(/(^.{8})(.+)(.{4}$)/, '$1...$3')}
                                </div>
                                <div className='flex1 tr'>{e.outputs}</div>
                                <div className='flex1 tr'>{numeral(e.balance).format('0,0.0000')}</div>
                            </div>
                        )
                    })}
                    <div style={{ height: 26 }} className='flex c fz14'>
                        ......
                    </div>
                    <div style={{ height: 26 }} className='flex ac jsb mb8 fz14'>
                        <div className='flex1'>总额</div>
                        <div className='flex1 tr'>{numeral(1000).format('0,0')}</div>
                        <div className='flex1 tr'>{numeral(10000).format('0,0.0000')}</div>
                    </div>
                </div>
                <Button className='mt24 mb16' block color='primary'>
                    归集
                </Button>
                <div className='fz14 cS'>
                    说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：
                    说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：说明：
                </div>
            </div>
        </div>
    )
}
