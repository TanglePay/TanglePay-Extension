import React, { useEffect, useState } from 'react'
import { Input, Button } from 'antd-mobile'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { useGetNodeWallet } from '@tangle-pay/store/common'
import { useLocation } from 'react-router-dom'
import { Nav, Toast } from '@/common'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { context, checkWalletIsPasswordEnabled } from '@tangle-pay/domain'

export const PrivateKeyMnemonic = () => {
    let params = useLocation()
    params = Base.handlerParams(params.search)
    const id = params.id
    const [password, setPassword] = useState('')
    const [keyStr, setKeyStr] = useState('')
    const [_, walletsList] = useGetNodeWallet()
    const curEdit = walletsList.find((e) => e.id === id) || {}
    const name = curEdit.name || ''

    useEffect(async () => {
        const func = async () => {
            const isEnabled = await checkWalletIsPasswordEnabled(curEdit.id)
            if (!isEnabled && context.state.isPinSet) {
                const privateKeyStr = await IotaSDK.decryptSeed(curEdit.mnemonic, context.state.pin, true)
                setKeyStr(privateKeyStr.replace(/^0x/, ''))
            }
        }
        func()
    }, [])

    return (
        <div>
            <Nav title={name} />
            <div>
                <div className='p16'>
                    <div className='border radius10 p8'>
                        <div className='fz16' style={{ lineHeight: '18px', wordBreak: 'break-all' }}>
                            {curEdit.address}
                        </div>
                    </div>
                </div>
                <div className='ph16'>
                    <div className='flex c pt8 pb24'>
                        <div className='fz18 fw600'>{I18n.t('account.showKeyMnemonic')}</div>
                    </div>
                    <div>
                        <div className='fz16'>{I18n.t(keyStr ? 'account.copyKeyTipsMnemonic' : 'assets.passwordTips').replace('{name}', name)}</div>
                        {!keyStr ? (
                            <Input type='password' value={password} onChange={setPassword} className='border-b mt15 mb8' />
                        ) : (
                            <CopyToClipboard text={keyStr} onCopy={() => Toast.success(I18n.t('assets.copied'))}>
                                <div className='fz16 pt8 fw600 press' style={{ lineHeight: '18px', wordBreak: 'break-word' }}>
                                    {keyStr}
                                </div>
                            </CopyToClipboard>
                        )}
                    </div>
                    <div className='mt16 mb32 radius10 p10' style={{ backgroundColor: 'rgba(213, 53, 84, 0.05)' }}>
                        <div className='fz14' style={{ color: '#D53554' }}>
                            {I18n.t('account.showKeyTipsMnemonic')}
                        </div>
                    </div>
                    {!keyStr ? (
                        <div className='flex row jsb ac'>
                            {/* <Button
                                className='flex1 mr10 radius10'
                                style={{ height: 44 }}
                                block
                                color='primary'
                                fill='outline'>
                                {I18n.t('apps.cancel')}
                            </Button> */}
                            <Button
                                onClick={async () => {
                                    try {
                                        const privateKeyStr = await IotaSDK.getPrivateKey(curEdit.seed, password)
                                        setKeyStr(privateKeyStr.replace(/^0x/, ''))
                                    } catch (error) {
                                        return Toast.error(I18n.t('assets.passwordError'))
                                    }
                                }}
                                className='flex1 radius10'
                                style={{ height: 44 }}
                                disabled={!password}
                                color='primary'
                                block>
                                {I18n.t('apps.execute')}
                            </Button>
                        </div>
                    ) : (
                        <div className='flex row ac jsb'>
                            <Button
                                onClick={() => {
                                    Base.goBack()
                                }}
                                className='flex1 radius10'
                                style={{ height: 44 }}
                                color='primary'
                                block>
                                {I18n.t('account.done')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
