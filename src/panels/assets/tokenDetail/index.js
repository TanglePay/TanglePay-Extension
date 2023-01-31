import React, { useState, useRef, useEffect } from 'react'
import { Nav, SvgIcon, Toast } from '@/common'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { useStore } from '@tangle-pay/store'
import { Form, Input, Button } from 'antd-mobile'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useGetNodeWallet, useHandleUnlocalConditions } from '@tangle-pay/store/common'
import { useLocation } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard'

const schema = Yup.object().shape({
    password: Yup.string().required()
})

export const TokenDetail = () => {
    const form = useRef()
    const [curWallet] = useGetNodeWallet()
    let params = useLocation()
    params = Base.handlerParams(params.search)
    let { tokenId, name, standard, logoUrl } = params
    name = (name || '').toLocaleUpperCase()
    return (
        <div className='page'>
            <Nav title={I18n.t('assets.tokenDetail')} />
            <div>
                <div className='flex c column' style={{ marginTop: 72, marginBottom: 48 }}>
                    <div className='flex c pr'>
                        <img
                            className='border pa bgW'
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 64,
                                left: 0,
                                opacity: 1,
                                top: 0,
                                zIndex: 0
                            }}
                            src={logoUrl}
                            alt=''
                            onError={(e) => {
                                e.target.style.opacity = 0
                            }}
                        />
                        <div
                            className='border bgP flex c cW fw600 fz30'
                            style={{ width: 64, height: 64, borderRadius: 64 }}>
                            {String(name).toLocaleUpperCase()[0]}
                        </div>
                    </div>
                    <div className='fz16 mt8 fw600'>{name}</div>
                </div>
                <div className='ph16'>
                    {standard ? (
                        <div className='mb16 bgS radius10 flex ac jsb ph16' style={{ height: 48 }}>
                            <div className='fz16 fw600'>{I18n.t('assets.standard')}</div>
                            <div className='fz16 fw600'>{standard}</div>
                        </div>
                    ) : null}
                    {name ? (
                        <div className='mb16 bgS radius10 flex ac jsb ph16' style={{ height: 48 }}>
                            <div className='fz16 fw600'>{I18n.t('assets.tokenName')}</div>
                            <div className='fz16 fw600'>{name}</div>
                        </div>
                    ) : null}
                    <div className='mb16 bgS radius10 ph16 pv15'>
                        <div className='fz16 fw600 mb4'>{I18n.t('assets.tokenID')}</div>
                        <CopyToClipboard text={tokenId} onCopy={() => Toast.success(I18n.t('assets.copied'))}>
                            <div className='fz16 fw400 press' style={{ wordBreak: 'break-all' }}>
                                {tokenId}
                            </div>
                        </CopyToClipboard>
                    </div>
                </div>
            </div>
        </div>
    )
}
