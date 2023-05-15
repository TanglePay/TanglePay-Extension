import React, { useState, useRef, useEffect } from 'react'
import { Base, I18n, IotaSDK } from '@tangle-pay/common'
import { Button, Swiper } from 'antd-mobile'
import { useLocation } from 'react-router-dom'
import { Nav, Toast } from '@/common'
import { useStore } from '@tangle-pay/store'
import { useAddWallet } from '@tangle-pay/store/common'
import {  markWalletPasswordEnabled } from '@tangle-pay/domain';
import './index.less'

const VerifyItem = ({ setNext, index, word, err, isTop, isLast, addWallet }) => {
    const [error, setError] = useState(false)
    const [registerInfo, setRegisterInfo] = useStore('common.registerInfo')
    const handleVerify = async (curWord) => {
        if (word === curWord) {
            if (isLast) {
                try {
                    Toast.showLoading()
                    const res = await IotaSDK.importMnemonic(registerInfo)
                    if (registerInfo.passwordIsPassword) {
						await markWalletPasswordEnabled(res.id);
					}
                    addWallet(res)
                    setRegisterInfo({})
                    Toast.hideLoading()
                    Base.replace('/main')
                } catch (error) {
                    console.log(error)
                    Toast.hideLoading()
                    Base.goBack()
                }
            } else {
                setNext()
            }
            // isLast ? Base.push('/account/verifySucc') : setNext()
        }
        setError(word !== curWord)
    }
    const topStr = isTop ? word : err
    const bottomStr = isTop ? err : word
    return (
        <div className='ph20 bgW'>
            <div style={{ marginTop: 120, marginBottom: 120 }}>
                <div className={`fz18 tc ${error && 'cR'}`}>Word # {index + 1}</div>
            </div>
            <div>
                <Button
                    type='submit'
                    size='large'
                    color='default'
                    style={{ backgroundColor: '#F5F5F5', border: 0 }}
                    className='mb16'
                    onClick={() => handleVerify(topStr)}
                    block>
                    {topStr}
                </Button>
                <Button
                    type='submit'
                    size='large'
                    color='default'
                    style={{ backgroundColor: '#F5F5F5', border: 0 }}
                    onClick={() => handleVerify(bottomStr)}
                    block>
                    {bottomStr}
                </Button>
            </div>
        </div>
    )
}

export const AccountVerifyMnemonic = () => {
    const addWallet = useAddWallet()
    const [curIndex, setCurInex] = useState(0)
    let params = useLocation()
    params = Base.handlerParams(params.search)
    let { list = '', errList = '' } = params
    list = (list || '').split(',')
    errList = (errList || '').split(',')
    const carousel = useRef()
    const setNext = () => {
        carousel.current.swipeNext()
    }
    useEffect(() => {
        document.onkeydown = (e) => {
            if (e.code == 'Space') {
                e.stopPropagation()
                e.preventDefault()
            }
        }
        return () => {
            document.onkeydown = null
        }
    }, [])
    return (
        <div className='page verify-mnemonic-page'>
            <Nav title={`${I18n.t('account.testBackup')} (${curIndex + 1}/${list.length})`} />
            <Swiper
                ref={carousel}
                allowTouchMove={false}
                autoplay={false}
                loop={false}
                onIndexChange={(i) => setCurInex(i)}>
                {list.map((item, index) => {
                    return (
                        <Swiper.Item key={`${item.word}_${index}`}>
                            <VerifyItem
                                addWallet={addWallet}
                                setNext={setNext}
                                key={`${item.word}_${index}`}
                                word={item}
                                err={errList[index]}
                                index={index}
                                isTop={Math.random() >= 0.5}
                                isLast={index === list.length - 1}
                            />
                        </Swiper.Item>
                    )
                })}
            </Swiper>
        </div>
    )
}
