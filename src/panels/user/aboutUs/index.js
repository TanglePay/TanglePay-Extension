import React from 'react'
import { Base, I18n } from '@tangle-pay/common'
import { Nav, SvgIcon } from '@/common'
import { default as logo } from '@tangle-pay/assets/images/logo.png'

export const UserAboutUs = () => {
    var version = window?.chrome?.app?.getDetails()?.version || '1.0.0'
    const list = [
        {
            label: I18n.t('user.versionUpdate'),
            value: version,
            url: 'https://chrome.google.com/webstore/detail/tanglepay-iota-wallet/hbneiaclpaaglopiogfdhgccebncnjmc?hl=en-US'
        },
        {
            label: I18n.t('account.term'),
            url: 'https://tanglepay.com/terms.html'
        },
        {
            label: I18n.t('account.policy'),
            url: 'https://tanglepay.com/policy.html',
            bottom: 4
        },
        {
            label: I18n.t('user.website'),
            url: 'https://tanglepay.com'
        },
        {
            label: I18n.t('user.telegramGroup'),
            url: 'https://t.me/tanglepay'
        },
        {
            label: I18n.t('user.discord'),
            url: 'https://discord.gg/XmNd64fEc2'
        },
        {
            label: I18n.t('user.groupEmail'),
            url: 'mailto:support@tanglepay.com'
        }
    ]
    return (
        <div className='page'>
            <Nav title={I18n.t('user.aboutUs')} />
            <div style={{ overflowY: 'scroll', height: 600 - 48 }}>
                <div className='flex c pv24'>
                    <div className='flex row ac'>
                        <img className='mr12' style={{ width: 43, height: 40 }} src={logo} alt='' />
                        <div>
                            <div className='fw600 cP' style={{ fontSize: 24 }}>
                                TANGLEPAY
                            </div>
                            <div className='fz16 cS'>
                                {I18n.t('user.curVersion')}
                                {version}
                            </div>
                        </div>
                    </div>
                </div>
                {list.map((e, i) => {
                    return (
                        <div
                            key={i}
                            onClick={() => {
                                if (e.onPress) {
                                    e.onPress()
                                } else if (e.url) {
                                    Base.push(e.url, { blank: true })
                                }
                            }}
                            className={`flex row ac jsb ph16 pv20 press ${i === 0 ? 'border-t' : ''}`}
                            style={{
                                borderBottomColor: e.bottom ? '#f5f5f5' : '#f5f5f5',
                                borderBottomWidth: e.bottom || 1,
                                borderBottomStyle: 'solid'
                            }}>
                            <div className='flex row ac'>
                                <div className='fz16'>{e.label}</div>
                            </div>
                            <div className='flex row ac'>
                                {e.value && <div className='fz16 cS mr24'>{e.value}</div>}
                                <SvgIcon name='right' size={15} className='cB' />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
