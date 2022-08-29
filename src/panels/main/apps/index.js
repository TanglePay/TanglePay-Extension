import React, { useEffect, useState } from 'react'
import { AssetsNav } from '@/common'
import { Form, Input } from 'antd-mobile'
import { List } from './list'
import { Base } from '@tangle-pay/common'
import _uniq from 'lodash/uniq'
import { useStore } from '@tangle-pay/store'
import { useGetDappsConfig } from '@tangle-pay/store/dapps'
import { SvgIcon } from '@/common/assets'

export const Apps = () => {
    useGetDappsConfig()
    const [height, setHeight] = useState(0)
    const [dapps] = useStore('dapps.list')
    const [keywords] = useStore('dapps.keywords')
    const [tabs, setTabs] = useState([])
    const [list, setList] = useState([])
    const [searchStr, setSearch] = useState('')
    const [showList, setShowList] = useState([])
    const [curTab, setCurTab] = useState('All')
    useEffect(() => {
        const newList = list.filter((e) => e.tags.includes(curTab))
        if (!searchStr) {
            setShowList(newList)
        } else {
            const str = searchStr.toLocaleLowerCase()
            setShowList(
                newList.filter((e) => {
                    let { id, desc, developer, url } = e
                    if (
                        [id, desc, developer, url].find((a) =>
                            String(a || '')
                                .toLocaleLowerCase()
                                .includes(str)
                        )
                    ) {
                        return true
                    }
                    return false
                })
            )
        }
    }, [searchStr, curTab, JSON.stringify(list)])
    useEffect(() => {
        const input = document.getElementById('input')
        const onKeydown = (e) => {
            if (e.keyCode == '13') {
                let value = e.target.value
                if (/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/.test(value)) {
                    Base.push(`https://${value}`)
                } else if (/(http|https):\/\/([\w.]+\/?)\S*/.test(value)) {
                    Base.push(value)
                }
            }
        }
        input.addEventListener('keydown', onKeydown)
        return () => {
            input.removeEventListener('keydown', onKeydown)
        }
    }, [])
    useEffect(() => {
        let tabs = []
        const list = []
        for (const i in dapps) {
            const item = dapps[i]
            list.push({ ...item, id: i })
            tabs = _uniq([...tabs, ...item.tags])
        }
        tabs = tabs.map((e) => {
            return {
                label: e
            }
        })
        setList(list)
        setTabs(tabs)
    }, [JSON.stringify(dapps)])
    useEffect(() => {
        const dom = document.getElementById('apps-id')
        const height = document.body.offsetHeight - dom.offsetTop - 61
        setHeight(height)
    }, [JSON.stringify(list), JSON.stringify(keywords)])
    return (
        <div className='h100'>
            {/* <AssetsNav /> */}
            <div className='pt24'>
                <div style={{ height: 36, padding: 6 }} className='mh16 flex row ac bgS radius10'>
                    <SvgIcon name='search' color='#6C737C' size='20' />
                    <Input
                        className='ml4 fw400 fz16'
                        id='input'
                        value={searchStr}
                        onChange={setSearch}
                        placeholder='Search Dapp'
                        style={{
                            '--placeholder-color': '#6C737C',
                            '--font-size': '16px'
                        }}
                    />
                </div>
                <div className='ph16 flex row ac pt16 jsb' style={{ flexWrap: 'wrap' }}>
                    {keywords.map((e) => {
                        return (
                            <div
                                onClick={() => setSearch(e.url)}
                                key={e.label}
                                className='press pv8 ph16 mb8 bgS radius10'>
                                <span className='fz16'>{e.label}</span>
                            </div>
                        )
                    })}
                </div>
                <div>
                    <div>
                        <div className='ph16 flex ac row pt8 pb4 border-b'>
                            {tabs.map((e) => {
                                const cur = curTab === e.label
                                return (
                                    <div
                                        className='press pv10 pr10'
                                        key={e.label}
                                        onClick={() => {
                                            setCurTab(e.label)
                                        }}>
                                        <span className={`fz16 mr10 ${!cur ? 'cB' : 'cP'}`}>{e.label}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className='ph16'>
                        <List list={showList} height={height} />
                    </div>
                </div>
            </div>
        </div>
    )
}
