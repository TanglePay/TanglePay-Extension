import React from 'react'
import { Button } from 'antd-mobile'
import { Base, I18n, IotaSDK, Toast } from '@/common'
import { useStore } from '@/store'
import { useAddWallet } from '@/store/common'

export const AccountVerifySucc = () => {
    const addWallet = useAddWallet()
    const [registerInfo, seRegisterInfo] = useStore('common.registerInfo')
    return (
        <div className='page'>
            <div>
                <div className='p40'>
                    <div
                        className='fz14'
                        dangerouslySetInnerHTML={{
                            __html: I18n.t('account.registerSucc').replace(/\n/g, '<br/>')
                        }}></div>
                    <Button
                        block
                        size='large'
                        color='primary'
                        className='mt50'
                        onClick={async () => {
                            try {
                                Toast.showLoading()
                                const res = await IotaSDK.importMnemonic(registerInfo)
                                addWallet(res)
                                seRegisterInfo({})
                                Toast.hideLoading()
                                Base.replace('/main')
                            } catch (error) {
                                console.log(error)
                                Toast.hideLoading()
                                Base.goBack()
                            }
                        }}>
                        {I18n.t('account.start')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
