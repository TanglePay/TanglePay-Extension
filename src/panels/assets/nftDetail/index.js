import React, { useState } from 'react'
import { Nav, SvgIcon, Toast } from '@/common'
import { Base, I18n } from '@tangle-pay/common'
import * as Yup from 'yup'
import { useLocation } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard'

const schema = Yup.object().shape({
    password: Yup.string().required()
})

export const NftDetail = () => {
    let params = useLocation()
    params = Base.handlerParams(params.search)
    params = JSON.parse(params.nft)
    let { thumbnailImage, media, attributes, properties } = params
    attributes = attributes?.props || attributes || properties || {}
    let propsList = []
    for (const i in attributes) {
        if (Object.hasOwnProperty.call(attributes, i)) {
            const obj = attributes[i]
            let label = ''
            for (const j in obj) {
                if (j !== 'value') {
                    label = j
                }
            }
            propsList.push({
                label,
                value: obj.value
            })
        }
    }
    const [openDetail, setOpenDetail] = useState(false)
    const [openProperties, setOpenProperties] = useState(false)
    return (
        <div className='page'>
            <Nav title={I18n.t('assets.nftInfo')} />
            <div className='ph32 page-content'>
                <div className='flex c column' style={{ marginTop: 32, marginBottom: 16 }}>
                    <img
                        className='bgS'
                        style={{
                            borderRadius: 36,
                            width: 128,
                            height: 128,
                            objectFit: 'contain'
                        }}
                        src={thumbnailImage || media}
                    />
                    <div className='fz18 mt8 fw600 tc'>{params.name}</div>
                    <div className='fz18 mt4 fw600 cS'>{params.issuerName}</div>
                    <div className='fz16 mt12 fw400 cS'>{params.description}</div>
                </div>
                <div>
                    <div
                        className='press flex row ac'
                        onClick={() => {
                            setOpenDetail(!openDetail)
                        }}
                        style={{ height: 32 }}>
                        <div className='fz18 fw600 mr4'>{I18n.t('assets.nftDetail')}</div>
                        <SvgIcon size={14} name='up' style={!openDetail && { transform: 'rotate(180deg)' }} />
                    </div>
                    {openDetail ? (
                        <div>
                            {params.standard ? (
                                <div className='mb8 bgS radius10 flex ac jsb ph16' style={{ height: 48 }}>
                                    <div className='fz16 fw400'>{I18n.t('assets.standard')}</div>
                                    <div className='fz16 fw400'>{params.standard}</div>
                                </div>
                            ) : null}
                            {params.nftId ? (
                                <div className='mb8 bgS radius10 ph16 pv8'>
                                    <div className='fz16 fw400 mb4'>NFT ID</div>
                                    <CopyToClipboard
                                        text={params.nftId}
                                        onCopy={() => Toast.success(I18n.t('assets.copied'))}>
                                        <div className='fz14 press' style={{ wordBreak: 'break-all' }}>
                                            {params.nftId}
                                        </div>
                                    </CopyToClipboard>
                                </div>
                            ) : null}
                            <div className='mb8 bgS radius10 ph16 pv8'>
                                <div className='fz16 fw400 mb4'>URI</div>
                                <CopyToClipboard
                                    text={params.uri}
                                    onCopy={() => Toast.success(I18n.t('assets.copied'))}>
                                    <div className='fz14 press' style={{ wordBreak: 'break-all' }}>
                                        {params.uri}
                                    </div>
                                </CopyToClipboard>
                            </div>
                            {params.collectionId ? (
                                <div className='mb8 bgS radius10 ph16 pv8'>
                                    <div className='fz16 fw400 mb4'>{I18n.t('assets.collectionID')}</div>
                                    <CopyToClipboard
                                        text={params.collectionId}
                                        onCopy={() => Toast.success(I18n.t('assets.copied'))}>
                                        <div className='fz14 press' style={{ wordBreak: 'break-all' }}>
                                            {params.collectionId}
                                        </div>
                                    </CopyToClipboard>
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>
                <div className='pb24 mt16'>
                    <div
                        className='press flex row ac'
                        onClick={() => {
                            setOpenProperties(!openProperties)
                        }}
                        style={{ height: 32 }}>
                        <div className='fz18 fw600 mr4'>{I18n.t('assets.nftProperties')}</div>
                        <SvgIcon size={14} name='up' style={!openProperties && { transform: 'rotate(180deg)' }} />
                    </div>
                    {openProperties ? (
                        <div className='flex ac row mt8' style={{ flexWrap: 'wrap' }}>
                            {propsList.map((e) => {
                                return (
                                    <div className='bgS radius10 p12 mr8'>
                                        <div className='cS fz16 fw600'>{e.label}</div>
                                        <div className='mt4 fz16 fw600'>{e.value}</div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
