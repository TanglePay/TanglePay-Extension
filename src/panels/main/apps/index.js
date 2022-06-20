import React, { useEffect, useState } from 'react'
import { AssetsNav } from '@/common'
import { Form, Input } from 'antd-mobile'
import { List } from './list'
import { Base } from '@tangle-pay/common'
import _uniq from 'lodash/uniq'
import { useStore } from '@tangle-pay/store'
import { useGetDappsConfig } from '@tangle-pay/store/dapps'

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
                    Base.push(`http://${value}`)
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
        const height = document.body.offsetHeight - dom.offsetTop - 51
        setHeight(height)
    }, [JSON.stringify(list), JSON.stringify(keywords)])
    return (
        <div className='h100'>
            <AssetsNav />
            <div className='ph15'>
                <Form.Item style={{ paddingLeft: 0 }}>
                    <Input id='input' value={searchStr} onChange={setSearch} placeholder='Search Dapp' />
                </Form.Item>
                <div className='flex row ac pt20 jsb' style={{ flexWrap: 'wrap' }}>
                    {keywords.map((e) => {
                        return (
                            <div onClick={() => setSearch(e.url)} key={e.label} className='press p10 mb10 bgS radius10'>
                                <span className='fz12'>{e.label}</span>
                            </div>
                        )
                    })}
                </div>
                <div>
                    <div>
                        <div className='flex ac row pt30 pb15'>
                            {tabs.map((e) => {
                                const cur = curTab === e.label
                                return (
                                    <div
                                        className='press pv10 pr10'
                                        key={e.label}
                                        onClick={() => {
                                            setCurTab(e.label)
                                        }}>
                                        <span className={`fz15 mr10 ${!cur ? 'cB' : 'cP fw600'}`}>{e.label}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <List list={showList} height={height} />
                </div>
            </div>
        </div>
    )
}
