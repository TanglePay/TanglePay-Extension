import React, { useState, useEffect, useRef } from 'react'
import { panelsList } from '@/panels'
import { Base, Trace, I18n, IotaSDK } from '@tangle-pay/common'
import { useChangeNode } from '@tangle-pay/store/common'
import { HashRouter, Route, Redirect } from 'react-router-dom'
import { StoreContext, useStoreReducer } from '@tangle-pay/store'
import { context, ensureInited, getIsUnlocked, init as pinInit, markWalletPasswordEnabled, isNewWalletFlow, setStorageFacade } from '@tangle-pay/domain'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { PasswordDialog, StorageFacade } from '@/common'
import { CacheSwitch, CacheRoute } from 'react-router-cache-route'
import { Toast } from '@/common'
import { DappDialog } from '@/common/components/DappDialog'
import './App.less'

const AnimatedSwitch = (props) => {
    const { children } = props
    return (
        <CacheRoute
            render={({ location }) => (
                <TransitionGroup>
                    <CSSTransition key={location.key} classNames='fade' timeout={300}>
                        <CacheSwitch location={location}>{children}</CacheSwitch>
                    </CSSTransition>
                </TransitionGroup>
            )}
        />
    )
}
const getFirstScreen = async (store) => {
    await ensureInited()
    const isNewUser = await isNewWalletFlow()
    if (!isNewUser) {
        await ensureExistingUserWalletStatus()
    }
    if (context.state.isPinSet && !getIsUnlocked()) {
        return '/unlock'
    } else {
        Base.globalDispatch({
            type: 'common.canShowDappDialog',
            data: true
        })
        return store.common.walletsList.length > 0 ? '/main' : '/account/changeNode'
    }
}
const ensureExistingUserWalletStatus = async () => {
    const isFixed = await Base.getLocalData('pin.isExistingFixed')
    if (isFixed) return
    const list = await IotaSDK.getWalletList()
    const tasks = []
    for (const wallet of list) {
        const { id, type } = wallet
        if (type === 'ledger') {
            continue
        }
        tasks.push(markWalletPasswordEnabled(id))
    }
    if (tasks.length > 0) {
        await Promise.all(tasks)
    }
    Base.setLocalData('pin.isExistingFixed', '1')
}

const App = () => {
    const [firstScreen, setFirstScreen] = useState('/')
    const [store, dispatch] = useStoreReducer()
    const changeNode = useChangeNode()
    const [sceneList, setSceneList] = useState([])
    const passwordDialog = useRef()
    const getLocalInfo = async () => {
        const list = ['common.curNodeId', 'common.showAssets', 'common.activityData', 'common.walletsList']
        const res = await Promise.all(list.map((e) => Base.getLocalData(e)))
        list.forEach((e, i) => {
            switch (e) {
                case 'common.walletsList':
                    IotaSDK.getWalletList().then((list) => {
                        if (list.length == 0) pinInit(0).catch((e) => console.log(e))
                        dispatch({ type: e, data: list })
                    })
                    break
                default:
                    dispatch({ type: e, data: res[i] })
                    break
            }
        })
        // i18n init
        const lang = I18n.language || 'en'
        dispatch({ type: 'common.lang', data: lang })
    }
    const initChangeNode = async () => {
        // changeNode after get walletsList
        const res = await Base.getLocalData('common.curNodeId')
        // dispatch({ type: 'common.curNodeId', data: res })
        await changeNode(res || IotaSDK.IOTA_NODE_ID)
    }
    const init = async () => {
        Trace.login()
        Toast.showLoading()

        // await IotaSDK.getNodes()
        IotaSDK.getNodes(async () => {
            await getLocalInfo()
            await initChangeNode()
            Toast.hideLoading()
            setSceneList(panelsList)
            setFirstScreen(await getFirstScreen(store))
        })
    }
    useEffect(() => {
        setStorageFacade(StorageFacade)
        Base.globalInit({
            store,
            dispatch,
            Toast
        })
        IotaSDK.passwordDialog = passwordDialog
        init()
    }, [])
    if (sceneList.length === 0) {
        return null
    }
    return (
        <div id='app' className='App'>
            <StoreContext.Provider
                value={{
                    store,
                    dispatch
                }}>
                <HashRouter ref={(router) => (Base.navigator = router)}>
                    <AnimatedSwitch>
                        {panelsList.map((item) => {
                            const key = `/${item.path}`
                            const RouteCom = item.path === 'main' ? CacheRoute : Route
                            return <RouteCom path={key} exact key={key} render={() => <item.component key={key} />} />
                        })}
                        <CacheRoute exact path='/'>
                            <Redirect to={firstScreen} />
                        </CacheRoute>
                    </AnimatedSwitch>
                </HashRouter>
                <PasswordDialog dialogRef={passwordDialog} />
                <DappDialog />
            </StoreContext.Provider>
        </div>
    )
}

export default App
