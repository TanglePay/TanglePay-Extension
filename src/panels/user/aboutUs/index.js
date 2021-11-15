import React from 'react'
import { Base, I18n, images, Nav } from '@tangle-pay/common'
export const UserAboutUs = () => {
    var version = '1.0.1'
    const list = [
        {
            label: I18n.t('user.versionUpdate'),
            bottom: 10,
            value: version,
            url: 'https://chrome.google.com/webstore/detail/tanglepay-iota-wallet/hbneiaclpaaglopiogfdhgccebncnjmc?hl=en-US'
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
            <div>
                <div className='flex c column pv30'>
                    <img style={{ width: 65, height: 65 }} src={images.com.logo} alt='' />
                    <div className='fz16 mt10'>TanglePay</div>
                    <div className='fz14 cS mt10'>
                        {I18n.t('user.curVersion')}
                        {version}
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
                            className={`flex row ac jsb ph20 pv20 press ${i === 0 ? 'border-t' : ''}`}
                            style={{
                                borderBottomColor: e.bottom ? '#f5f5f5' : '#f5f5f5',
                                borderBottomWidth: e.bottom || 1,
                                borderBottomStyle: 'solid'
                            }}>
                            <div className='flex row ac'>
                                <div className='fz17 ml10'>{e.label}</div>
                            </div>
                            <div className='flex row ac'>
                                {e.value && <div className='fz17 cS mr10'>{e.value}</div>}
                                <img style={{ width: 16, height: 16 }} src={images.com.right} alt='' />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
