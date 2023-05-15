import React from 'react'
import { Button } from 'antd-mobile'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import { useAddWallet } from '@tangle-pay/store/common'
import { Toast } from '@/common'
import { markWalletPasswordEnabled } from '@tangle-pay/domain';

export const AccountVerifySucc = () => {
    const addWallet = useAddWallet()
    const [registerInfo, seRegisterInfo] = useStore('common.registerInfo')
    return (
        <div className='page' style={{ overflow: 'scroll' }}>
            <div>
                <div className='p40'>
                    <div
                        className='fz14'
                        dangerouslySetInnerHTML={{
                            __html: I18n.t('account.registerSucc')
                                .replace(/\n/g, '<br/>')
                                .replace(/\<##/g, '<div class="fw600 fz17">')
                                .replace(/##\>/g, '</div>')
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
                                if (registerInfo.passwordIsPassword) {
                                    await markWalletPasswordEnabled(res.id);
                                }
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
