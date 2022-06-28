import React, { useEffect } from 'react'
import { AssetsNav, Nav, SvgIcon, Toast } from '@/common'
import { Button } from 'antd-mobile'
import { Base } from '@tangle-pay/common'
import numeral from 'numeral'
import { useStore } from '@tangle-pay/store'
import { useGetWalletInfo, useGetNodeWallet } from '@tangle-pay/store/common'
const XLSX = require('xlsx')

export const WalletDetail = () => {
    const [curWallet] = useGetNodeWallet()
    const [list, totalInfo, loading] = useGetWalletInfo()
    useEffect(() => {
        loading ? Toast.showLoading() : Toast.hideLoading()
        return () => {
            Toast.hideLoading()
        }
    }, [loading])
    return (
        <div>
            <AssetsNav />
            <Nav title={curWallet.name} />
            <div className='view-content ph16'>
                <div className='flex ac jsb' style={{ height: 60 }}>
                    <div className='fz16'>该seed下的地址</div>
                    <Button
                        onClick={() => {
                            const sheet = []
                            list.forEach((e, i) => {
                                sheet.push({
                                    address: e.address,
                                    nums: e.outputIds.length,
                                    balance: numeral(e.balanceMIOTA).format('0,0.0000')
                                })
                            })
                            const workBook = {
                                SheetNames: ['Sheet1'],
                                Sheets: {
                                    Sheet1: XLSX.utils.json_to_sheet(sheet)
                                },
                                Props: {}
                            }
                            XLSX.writeFile(workBook, `wallet.xlsx`, {
                                type: 'file',
                                bookType: 'xlsx'
                            })
                        }}
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
                {list.slice(0, 3).length > 0 ? (
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
                                    <div className='flex1 tr'>{e.outputIds.length}</div>
                                    <div className='flex1 tr'>{numeral(e.balanceMIOTA).format('0,0.0000')}</div>
                                </div>
                            )
                        })}
                        {list.length > 3 ? (
                            <div style={{ height: 26 }} className='flex c fz14'>
                                ......
                            </div>
                        ) : null}
                        <div style={{ height: 26 }} className='flex ac jsb mb8 fz14'>
                            <div className='flex1'>总额</div>
                            <div className='flex1 tr'>{totalInfo?.outputIds?.length || 0}</div>
                            <div className='flex1 tr'>{numeral(totalInfo?.balanceMIOTA || 0).format('0,0.0000')}</div>
                        </div>
                    </div>
                ) : null}
                <div className='mt24'></div>
                {totalInfo?.outputIds?.length >= 10 ? (
                    <Button
                        onClick={() => {
                            Base.push('/user/WalletCollection')
                        }}
                        className='mb16'
                        block
                        color='primary'>
                        output 归集
                    </Button>
                ) : null}
                <div className='fz14 cS'>说明：</div>
            </div>
        </div>
    )
}
