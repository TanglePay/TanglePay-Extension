//Auto generated script via bin_createPanel. Don't edit it manually.
import { Main } from './main'
import { AccountLogin } from './account/login'
import { AccountRegister } from './account/register'
import { AccountInto } from './account/into'
import { AccountBackup } from './account/backup'
import { AccountMnemonic } from './account/mnemonic'
import { AccountVerifyMnemonic } from './account/verifyMnemonic'
import { AccountVerifySucc } from './account/verifySucc'
import { AssetsWallets } from './assets/wallets'
import { AssetsSend } from './assets/send'
import { AssetsReceive } from './assets/receive'
import { UserWallets } from './user/wallets'
import { UserSetting } from './user/setting'
import { UserNetwork } from './user/network'
import { UserAboutUs } from './user/aboutUs'
import { UserLang } from './user/lang'
import { UserEditWallet } from './user/editWallet'
import { UserWalletPassword } from './user/walletPassword'
import { AccountChangeNode } from './account/changeNode'
import { StakingAdd } from './staking/add'
import { StakingHistory } from './staking/history'
import { PrivateKey } from './user/privateKey'
import { AccountIntoPrivateKey } from './account/into/privateKey'
import { Staking } from './main/staking'
import { RemoveWallet } from './user/editWallet/removeWallet'
export const panelsList = [
    {
        path: 'user/removeWallet',
        component: RemoveWallet
    },
    {
        path: 'stake/index',
        component: Staking
    },
    {
        path: 'account/into/privateKey',
        component: AccountIntoPrivateKey
    },
    {
        path: 'user/privateKey',
        component: PrivateKey
    },
    {
        path: 'staking/history',
        component: StakingHistory
    },
    {
        path: 'staking/add',
        component: StakingAdd
    },
    {
        path: 'account/changeNode',
        component: AccountChangeNode
    },
    {
        path: 'user/walletPassword',
        component: UserWalletPassword
    },
    {
        path: 'user/editWallet',
        component: UserEditWallet
    },
    {
        path: 'user/lang',
        component: UserLang
    },
    {
        path: 'user/aboutUs',
        component: UserAboutUs
    },
    {
        path: 'user/network',
        component: UserNetwork
    },
    {
        path: 'user/setting',
        component: UserSetting
    },
    {
        path: 'user/wallets',
        component: UserWallets
    },
    {
        path: 'assets/receive',
        component: AssetsReceive
    },
    {
        path: 'assets/send',
        component: AssetsSend
    },
    {
        path: 'assets/wallets',
        component: AssetsWallets
    },
    {
        path: 'account/verifySucc',
        component: AccountVerifySucc
    },
    {
        path: 'account/verifyMnemonic',
        component: AccountVerifyMnemonic
    },
    {
        path: 'account/mnemonic',
        component: AccountMnemonic
    },
    {
        path: 'account/backup',
        component: AccountBackup
    },
    {
        path: 'account/into',
        component: AccountInto
    },
    {
        path: 'account/register',
        component: AccountRegister
    },
    {
        path: 'account/login',
        component: AccountLogin
    },
    {
        path: 'main',
        component: Main
    }
]
