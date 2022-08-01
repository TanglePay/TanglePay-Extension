import React, { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Form, Input, Button } from 'antd-mobile'
import { useRemoveWallet, useGetNodeWallet } from '@tangle-pay/store/common'
import { Base, I18n } from '@tangle-pay/common'
import { Nav, Toast } from '@/common'
import { Formik } from 'formik'
import * as Yup from 'yup'

const schema = Yup.object().shape({
    password: Yup.string().required()
})
export const ClaimResult = () => {
    let params = useLocation()
    params = Base.handlerParams(params.search)
    const id = params.id
    const [_, walletsList] = useGetNodeWallet()
    const curEdit = walletsList.find((e) => e.id === id) || {}
    const name = curEdit.name || ''
    return (
        <div>
            <Nav title={name} />
            <div className='p16'>
                <div className='fz18 fw600 pb16'>Shimmer Staking Rewards Claimed</div>
                <div className='fz18 pb16 fw600'>
                    SMR数量：<span className='cP'>32983</span>
                </div>
                <div className='fz18 pb16'>
                    新创建的Shimmer钱包助记词与初始密码与您的IOTA钱包{' '}
                    <span className='fw600'>
                        {name} {Base.handleAddress(curEdit.address)}
                    </span>
                    一致
                </div>
                <div className='fz18 mb16'>为了您的资产安全，建议您修改钱包密码或者将资产转移到全新的Shimmer钱包</div>
                <div className='flex row ac jsb' style={{ marginTop: 100 }}>
                    <Button
                        onClick={() => {
                            Base.replace('/main')
                        }}
                        className='flex1 radius8'
                        style={{ height: 48 }}
                        color='primary'
                        block>
                        I Understand
                    </Button>
                </div>
            </div>
        </div>
    )
}
