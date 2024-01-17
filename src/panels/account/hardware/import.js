import React, { useEffect, useRef, useState } from 'react'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { Formik } from 'formik'
import { Form, Input, Button, Picker } from 'antd-mobile'
import * as Yup from 'yup'
import { useCreateCheck } from '@tangle-pay/store/common'
import { Nav, SvgIcon, Toast } from '@/common'
import { useLocation } from 'react-router-dom'
import { useGetNodeWallet, useChangeNode, useSelectWallet } from '@tangle-pay/store/common'

export const AccountHardwareImport = () => {
    let params = useLocation()
    params = Base.handlerParams(params.search)
    let list = []
    try {
        list = JSON.parse(params.list)
    } catch (error) {}
    const [showList, setShowList] = useState(list || [])
    useEffect(() => {
        const init = async () => {
            const newList = JSON.parse(JSON.stringify(showList))
            for (let i = 0; i < newList.length; i++) {
                const e = newList[i]
                const { balances } = e
                const balanceList = []
                balances.forEach((e) => {
                    const node = IotaSDK.nodes.find((d) => d.id == e.nodeId) || {}
                    if (Number(e.balance) > 0) {
                        balanceList.push(`${Base.formatNum(IotaSDK.getNumberStr(e.balance / Math.pow(10, node.decimal)))} ${node.token}`)
                    }
                })
                newList[i].balanceStr = balanceList.slice(0, 2).join(' / ')
                newList[i].hasImportc = await IotaSDK.checkImport(e.address)
                let address = e.address.replace(new RegExp(`^${IotaSDK.curNode?.bech32HRP || ''}`), '').replace(/^0x/i, '')
                address = address.replace(/(^.{4})(.+)(.{6}$)/, '$1...$3')
                if (IotaSDK.curNode?.type == 2) {
                    address = `0x${address}`
                } else {
                    address = `${IotaSDK.curNode?.bech32HRP || ''}${address}`
                }
                newList[i].addressStr = address
            }
            setShowList(newList)
        }
        init()
    }, [])
    return (
        <div className='page'>
            <Nav title={I18n.t('account.lederImport')} />
            <div className='ph16'>
                {showList.length > 0 ? (
                    <>
                        <div style={{ height: 420, overflowY: 'scroll' }}>
                            {showList.map((e) => {
                                const hasSelect = showList.find((d) => d.address == e.address && d.hasSelect)
                                const borderColor = e.hasImport ? '#ccc' : hasSelect ? '#3671EE' : '#ccc'
                                const background = e.hasImport ? '#ccc' : hasSelect ? '#3671EE' : 'transparent'
                                return (
                                    <div
                                        key={e.address}
                                        className={`flex pv8 ac jsb border-b mt8 ${e.hasImport ? '' : 'press'}`}
                                        onClick={() => {
                                            if (e.hasImport) {
                                                return
                                            }
                                            const newList = JSON.parse(JSON.stringify(showList))
                                            const i = newList.findIndex((d) => d.address == e.address)
                                            newList.forEach((e) => (e.hasSelect = false))
                                            newList[i] = { ...e, hasSelect: true }
                                            setShowList(newList)
                                        }}>
                                        <div className='flex ac jsb'>
                                            <div
                                                className='border'
                                                style={{
                                                    borderRadius: 4,
                                                    width: 16,
                                                    height: 16,
                                                    background,
                                                    borderColor,
                                                    padding: 1,
                                                    marginRight: 10
                                                }}></div>
                                            <div style={{ width: 90 }} className='fz16 fw400 tl'>
                                                {e.addressStr}
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }} className='fz16 fw400 tr ellipsis'>
                                            {e.balanceStr}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className='flex ac jsb ph16' style={{ marginTop: 40 }}>
                            <Button
                                className='mr24'
                                size='middle'
                                fill='outline'
                                color='primary'
                                block
                                onClick={() => {
                                    Base.replace('/main')
                                }}>
                                {I18n.t('apps.cancel')}
                            </Button>
                            <Button
                                size='middle'
                                color='primary'
                                block
                                onClick={async () => {
                                    const selectList = showList.filter((e) => e.hasSelect)
                                    if (selectList.length == 0) {
                                        return Toast.show('Please select the account that needs to be imported.')
                                    }
                                    const addressList = await Promise.all(
                                        selectList.map((e) => {
                                            return IotaSDK.importHardware({
                                                address: e.address,
                                                name: `${params.name} ${e.index}`,
                                                publicKey: e.publicKey,
                                                path: e.path,
                                                type: 'ledger'
                                            })
                                        })
                                    )
                                    let walletsList = await IotaSDK.getWalletList()
                                    walletsList = [...walletsList, ...addressList]
                                    walletsList = [
                                        ...walletsList.map((e) => {
                                            return { ...e, isSelected: false }
                                        })
                                    ]
                                    walletsList[walletsList.length - 1].isSelected = true
                                    Base.globalDispatch({
                                        type: 'common.walletsList',
                                        data: [...walletsList]
                                    })
                                    Base.replace('/main')
                                }}>
                                {I18n.t('assets.importBtn')}
                            </Button>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    )
}
