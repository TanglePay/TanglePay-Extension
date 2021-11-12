import React, { useState, useImperativeHandle } from 'react'
import { Button, Mask } from 'antd-mobile'
import { I18n, Base, images } from '@tangle-pay/common'
import {
    FacebookShareCount,
    PinterestShareCount,
    VKShareCount,
    OKShareCount,
    RedditShareCount,
    TumblrShareCount,
    HatenaShareCount,
    FacebookShareButton,
    FacebookMessengerShareButton,
    FacebookMessengerIcon,
    LinkedinShareButton,
    TwitterShareButton,
    PinterestShareButton,
    VKShareButton,
    OKShareButton,
    TelegramShareButton,
    WhatsappShareButton,
    RedditShareButton,
    EmailShareButton,
    TumblrShareButton,
    LivejournalShareButton,
    MailruShareButton,
    ViberShareButton,
    WorkplaceShareButton,
    LineShareButton,
    WeiboShareButton,
    PocketShareButton,
    InstapaperShareButton,
    HatenaShareButton,
    FacebookIcon,
    TwitterIcon,
    LinkedinIcon,
    PinterestIcon,
    VKIcon,
    OKIcon,
    TelegramIcon,
    WhatsappIcon,
    RedditIcon,
    TumblrIcon,
    MailruIcon,
    EmailIcon,
    LivejournalIcon,
    ViberIcon,
    WorkplaceIcon,
    LineIcon,
    PocketIcon,
    InstapaperIcon,
    WeiboIcon,
    HatenaIcon
} from 'react-share'
export const ShareDialog = ({ dialogRef }) => {
    const [isShow, setShow] = useState(false)
    const [address, setAddress] = useState('')
    useImperativeHandle(
        dialogRef,
        () => {
            return {
                show
            }
        },
        []
    )
    const show = (address) => {
        setShow(true)
        setAddress(address)
    }
    const hide = () => {
        setShow(false)
    }
    console.log(address, '----')
    return (
        <Mask className='m0' opacity={0.3} onMaskClick={hide} visible={isShow}>
            <div className='p30 w100 radius10 bgS'>
                <div className='mv20 bgW radius10'>
                    <FacebookMessengerShareButton
                        url={address}
                        appId='521270401588372'
                        className='Demo__some-network__share-button'>
                        <FacebookIcon size={32} round />
                    </FacebookMessengerShareButton>
                </div>
            </div>
        </Mask>
    )
}
