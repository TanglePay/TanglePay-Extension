import React, { useState } from 'react'
import { Input, Button } from 'antd-mobile'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { useGetNodeWallet } from '@tangle-pay/store/common'
import { useLocation } from 'react-router-dom'
import { Nav, Toast } from '@/common'
import { CopyToClipboard } from 'react-copy-to-clipboard'

export const PrivateKey = () => {
    let params = useLocation()
    params = Base.handlerParams(params.search)
    const id = params.id
    const [password, setPassword] = useState('')
    const [keyStr, setKeyStr] = useState('')
    const [_, walletsList] = useGetNodeWallet()
    const curEdit = walletsList.find((e) => e.id === id) || {}
    const name = curEdit.name || ''
    return (
        <div>
            <Nav title={name} />
            <div>
                <div className='p20 border-b'>
                    <div className='border radius10 p10'>
                        <div className='fz13 cS' style={{ lineHeight: '20px' }}>
                            {curEdit.address}
                        </div>
                    </div>
                </div>
                <div className='ph20'>
                    <div className='flex c pv20'>
                        <div className='fz18'>{I18n.t('account.showKey')}</div>
                    </div>
                    <div>
                        <div className='fz14'>
                            {I18n.t(keyStr ? 'account.copyKeyTips' : 'account.showKeyInputPassword').replace(
                                '{name}',
                                name
                            )}
                        </div>
                        {!keyStr ? (
                            <Input
                                type='password'
                                value={password}
                                onChange={setPassword}
                                className='border-b mt15 pv10'
                            />
                        ) : (
                            <CopyToClipboard text={keyStr} onCopy={() => Toast.success(I18n.t('assets.copied'))}>
                                <div
                                    className='fz14 pt20 fw500 press'
                                    style={{ lineHeight: '20px', wordBreak: 'break-word' }}>
                                    {keyStr}
                                </div>
                            </CopyToClipboard>
                        )}
                    </div>
                    <div className='mv20 radius10 p10' style={{ backgroundColor: 'rgba(213, 53, 84, 0.05)' }}>
                        <div className='fz14' style={{ color: '#D53554' }}>
                            {I18n.t('account.showKeyTips')}
                        </div>
                    </div>
                    {!keyStr ? (
                        <div className='flex row jsb ac'>
                            <Button
                                className='flex1 mr10 radius10'
                                style={{ height: 44 }}
                                block
                                color='primary'
                                fill='outline'>
                                {I18n.t('apps.cancel')}
                            </Button>
                            <Button
                                onClick={() => {
                                    try {
                                        const privateKeyStr = IotaSDK.getPrivateKey(curEdit.seed, password)
                                        setKeyStr(privateKeyStr)
                                    } catch (error) {
                                        return Toast.error(I18n.t('assets.passwordError'))
                                    }
                                }}
                                className='flex1 ml10 radius10'
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
