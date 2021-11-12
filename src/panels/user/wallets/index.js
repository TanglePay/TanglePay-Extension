import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Base, Nav, I18n, images, Toast } from '@tangle-pay/common'
import { useGetNodeWallet } from '@tangle-pay/store/common'
export const UserWallets = () => {
    const [, walletsList] = useGetNodeWallet()
    return (
        <div className='page'>
            <Nav title={I18n.t('user.manageWallets')} />
            <div className='page-content ph20 pb20'>
                {walletsList.map((e) => {
                    return (
                        <div
                            className='flex ac jsb row border radius10 ph20 pv15 mt20 press'
                            style={{
                                borderColor: '#000'
                            }}
                            onClick={() => {
                                Base.push('/user/editWallet', { id: e.id })
                            }}
                            key={e.id}>
                            <div>
                                <div className='fz17'>{e.name}</div>
                                <div className='mt20 flex row ae'>
                                    <div className='fz15'>{Base.handleAddress(e.address)}</div>
                                    <CopyToClipboard
                                        text={e.address}
                                        onCopy={() => Toast.success(I18n.t('assets.copied'))}>
                                        <img
                                            className='press ml30'
                                            style={{ width: 20, height: 20 }}
                                            src={images.com.copy}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                e.preventDefault()
                                            }}
                                            alt=''
                                        />
                                    </CopyToClipboard>
                                </div>
                            </div>
                            <div>
                                <img style={{ width: 16, height: 16 }} src={images.com.right} alt='' />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
