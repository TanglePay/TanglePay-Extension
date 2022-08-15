import React, { useEffect } from 'react'
import { AssetsNav, Nav, SvgIcon, Toast } from '@/common'
import { Button } from 'antd-mobile'
import { Base, I18n } from '@tangle-pay/common'
import numeral from 'numeral'
import { useStore } from '@tangle-pay/store'
import { useGetWalletInfo, useGetNodeWallet } from '@tangle-pay/store/common'
const XLSX = require('xlsx')

export const WalletDetail = () => {
    const [curWallet] = useGetNodeWallet()
    const [list, totalInfo, loading] = useGetWalletInfo()
    useEffect(() => {
        loading ? Toast.showLoading() : Toast.hideLoading()
        if (!loading && Base.globalTemData.toastStr) {
            setTimeout(() => {
                Toast.show(Base.globalTemData.toastStr)
                Base.globalTemData.toastStr = ''
            }, 500)
        }
        return () => {
            Toast.hideLoading()
        }
    }, [loading])
    return (
        <div>
            {/* <AssetsNav /> */}
            <Nav title={I18n.t('account.walletDetail')} />
            <div className='page-content ph16'>
                <div className='flex ac jsb' style={{ height: 60 }}>
                    <div className='fz18'>{I18n.t('account.seedAddresses')}</div>
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
                        <span className='fw600 fz14'>{I18n.t('account.exportExcel')}</span>
                        <SvgIcon className='ml4' name='excel' color='white' size='14' />
                    </Button>
                </div>
                {list.slice(0, 3).length > 0 ? (
                    <div className='pt8'>
                        <div style={{ height: 26 }} className='flex ac jsb mb8 fz16'>
                            <div className='flex1'>{I18n.t('account.address')}</div>
                            <div className='flex1 tr'>{I18n.t('account.outputNum')}</div>
                            <div className='flex1 tr'>{I18n.t('account.iotaNum')}</div>
                        </div>
                        {list.map((e, i) => {
                            return (
                                <div key={i} style={{ height: 26 }} className='flex ac jsb mb8 fz16'>
                                    <div className='flex1'>
                                        {(e.address || '').replace(/(^.{8})(.+)(.{4}$)/, '$1...$3')}
                                    </div>
                                    <div className='flex1 tr'>{e.outputIds.length}</div>
                                    <div className='flex1 tr'>{numeral(e.balanceMIOTA).format('0,0.0000')}</div>
                                </div>
                            )
                        })}
                        {list.length > 3 ? (
                            <div style={{ height: 26 }} className='flex c fz16'>
                                ......
                            </div>
                        ) : null}
                        <div style={{ height: 26 }} className='flex ac jsb mb8 fz16'>
                            <div className='flex1'>{I18n.t('account.totalNum')}</div>
                            <div className='flex1 tr'>{totalInfo?.outputIds?.length || 0}</div>
                            <div className='flex1 tr'>{numeral(totalInfo?.balanceMIOTA || 0).format('0,0.0000')}</div>
                        </div>
                    </div>
                ) : null}
                <div className='mt24'></div>
                {/* {totalInfo?.outputIds?.length >= 3 ? ( */}
                <Button
                    onClick={() => {
                        Base.push('/user/WalletCollection')
                    }}
                    className='mb16'
                    block
                    color='primary'>
                    {I18n.t('account.outputCollect')}
                </Button>
                {/* ) : null} */}
                <div className='fz16 cS' style={{ lineHeight: '18px' }}>
                    {I18n.t('account.collectTips')}
                </div>
            </div>
        </div>
    )
}
