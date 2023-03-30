import React, { useEffect, useRef, useState } from 'react'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { Formik } from 'formik'
import { Form, Input, Button, Picker } from 'antd-mobile'
import * as Yup from 'yup'
import { useCreateCheck } from '@tangle-pay/store/common'
import { Nav, SvgIcon, Toast } from '@/common'
import { useLocation } from 'react-router-dom'
import { useGetNodeWallet, useChangeNode, useAddWallet } from '@tangle-pay/store/common'

export const AccountHardwareImport = () => {
    const changeNode = useChangeNode()
    const pageSize = 5
    let params = useLocation()
    const addWallet = useAddWallet()
    params = Base.handlerParams(params.search)
    const nodes = IotaSDK.nodes.filter((e) => e.type == params.type)
    const [list, setList] = useState([])
    const [showList, setShowList] = useState([])
    const [visible, setVisible] = useState(false)
    const [current, setCurrent] = useState(1)
    const getWalletList = async (current) => {
        Toast.showLoading()
        try {
            const walletList = await IotaSDK.getHardwareAddressList(current, pageSize)
            setList((list) => {
                const newList = [...list]
                walletList.forEach((e) => {
                    if (!newList.find((d) => d.address == e.address)) {
                        newList.push(e)
                    }
                })
                return newList
            })
            setShowList(walletList)
            Toast.hideLoading()
        } catch (error) {
            Toast.hideLoading()
            Toast.show(String(error))
        }
    }
    useEffect(() => {
        getWalletList(current)
    }, [current, IotaSDK.curNode?.id])
    return (
        <div className='page'>
            <Nav title={I18n.t('account.lederImport')} />
            <div className='ph16'>
                <div className='pv16 fz18 fw600'>{I18n.t('account.selectNode')}</div>
                <div
                    className='flex ac jsb bgS w100 ph16 fz18 press fw400'
                    style={{ height: 48, borderRadius: 10 }}
                    onClick={() => {
                        setVisible(true)
                    }}>
                    <div>{IotaSDK.curNode.name}</div>
                    <SvgIcon name='down' className='cS' size={16} />
                </div>
                <Picker
                    cancelText={I18n.t('apps.cancel')}
                    confirmText={I18n.t('apps.execute')}
                    columns={[
                        nodes.map((e) => {
                            return {
                                value: e.id,
                                label: e.name
                            }
                        })
                    ]}
                    visible={visible}
                    onClose={() => {
                        setVisible(false)
                    }}
                    value={[IotaSDK.curNode?.id]}
                    onConfirm={(v) => {
                        changeNode(v[0])
                    }}
                />
                {list.length > 0 ? (
                    <>
                        <div className='pt24 fz18 fw600'>Select an Account</div>
                        <div>
                            {showList.map((e) => {
                                const hasSelect = list.find((d) => d.address == e.address && d.hasSelect)
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
                                            const getList = (arr) => {
                                                const newList = [...arr]
                                                const i = newList.findIndex((d) => d.address == e.address)
                                                newList[i] = { ...e, hasSelect: !e.hasSelect }
                                                return newList
                                            }
                                            setList((list) => {
                                                return getList(list)
                                            })
                                        }}>
                                        <div
                                            className='border'
                                            style={{
                                                borderRadius: 4,
                                                width: 16,
                                                height: 16,
                                                background,
                                                borderColor,
                                                padding: 1
                                            }}></div>
                                        <div style={{ width: 40 }} className='ml25 fz16 fw400 tl'>
                                            {e.index}
                                        </div>
                                        <div style={{ width: 90 }} className='fz16 fw400 tl'>
                                            {Base.handleAddress(e.address)}
                                        </div>
                                        <div style={{ flex: 1 }} className='fz16 fw400 tr mr25 ellipsis'>
                                            {Base.formatNum(
                                                IotaSDK.getNumberStr(e.balance / Math.pow(10, IotaSDK.curNode?.decimal))
                                            )}
                                            {IotaSDK.curNode.token}
                                        </div>
                                        <SvgIcon name='share' className='cP' size={16} />
                                    </div>
                                )
                            })}
                            <div className='flex c mt16'>
                                <Button
                                    color='primary'
                                    disabled={current == 1}
                                    style={{
                                        background: 'transparent '
                                    }}
                                    onClick={() => {
                                        setCurrent(current - 1)
                                    }}
                                    fill='none'
                                    className='flex c mr12'>
                                    <SvgIcon style={{ lineHeight: 0 }} name='left' size={14} />
                                    <div style={{ lineHeight: 0 }} className='fz16 ml12'>
                                        PREV
                                    </div>
                                </Button>
                                <Button
                                    color='primary'
                                    fill='none'
                                    className='flex c'
                                    onClick={() => {
                                        setCurrent(current + 1)
                                    }}>
                                    <div style={{ lineHeight: 0 }} className='fz16 mr12'>
                                        NEXT
                                    </div>
                                    <SvgIcon style={{ lineHeight: 0 }} name='right' size={14} />
                                </Button>
                            </div>
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
                                    const selectList = list.filter((e) => e.hasSelect)
                                    if (selectList.length == 0) {
                                        return Toast.show(I18n.t('请选择需要导入的账户'))
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
