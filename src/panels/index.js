//Auto generated script via bin_createPanel. Don't edit it manually.
import { Main } from './main'
import { AccountLogin } from './account/login'
import { AccountRegister } from './account/register'
import { AccountRegisterPin } from './account/register/pin'
import { AccountResetPin } from './account/pin/reset'
import { AccountSetPin } from './account/pin/set'
import { UnlockScreen } from './account/unlock'
import { AccountInto } from './account/into'
import { AccountImportSelect } from './account/into/importSelect'
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
import { PrivateKeyMnemonic } from './user/privateKey/mnemonic'
import { AccountIntoPrivateKey } from './account/into/privateKey'
import { Staking } from './main/staking'
import { RemoveWallet } from './user/editWallet/removeWallet'
import { WalletDetail } from './user/walletDetail'
import { WalletCollection } from './user/walletDetail/collection'
import { ClaimReward } from './assets/claimReward/index'
import { ClaimSMR } from './assets/claimReward/claimSMR'
import { ClaimResult } from './assets/claimReward/claimResult'
import { UserAdvanced } from './user/advanced'
import { AssetsTrading } from './assets/trading'
import { AssetsTradingList } from './assets/trading/list'
import { TokenDetail } from './assets/tokenDetail/index'
import { NftDetail } from './assets/nftDetail/index'
import { ImportToken } from './assets/importToken/index'
import { AssetsNftMerge } from './assets/nftMerge'
import { AccountHardwareInto } from './account/hardware/into'
import { AccountHardwareImport } from './account/hardware/import'
import { AccountIntoPin } from './account/into/pin'
export const panelsList = [
    {
        path: 'account/pin/set',
        component: AccountSetPin
    },
    {
        path: 'account/pin/reset',
        component: AccountResetPin
    },
    {
        path: 'account/hardware/import',
        component: AccountHardwareImport
    },
    {
        path: 'account/hardware/into',
        component: AccountHardwareInto
    },
    {
        path: 'assets/nftMerge',
        component: AssetsNftMerge
    },
    {
        path: 'assets/importToken',
        component: ImportToken
    },
    {
        path: 'assets/nftDetail',
        component: NftDetail
    },
    {
        path: 'assets/tokenDetail',
        component: TokenDetail
    },
    {
        path: 'assets/tradingList',
        component: AssetsTradingList
    },
    {
        path: 'assets/trading',
        component: AssetsTrading
    },
    {
        path: 'user/advanced',
        component: UserAdvanced
    },
    {
        path: 'assets/claimReward/claimResult',
        component: ClaimResult
    },
    {
        path: 'assets/claimReward/claimSMR',
        component: ClaimSMR
    },
    {
        path: 'assets/claimReward',
        component: ClaimReward
    },
    {
        path: 'user/WalletCollection',
        component: WalletCollection
    },
    {
        path: 'user/walletDetail',
        component: WalletDetail
    },
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
        path: 'user/exportMnemonic',
        component: PrivateKeyMnemonic
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
        path: 'account/into/import',
        component: AccountImportSelect
    },
    {
        path: 'account/intopin',
        component: AccountIntoPin
    },
    {
        path: 'account/register',
        component: AccountRegister
    },
    {
        path: 'account/registerPin',
        component: AccountRegisterPin
    },
    {
        path: 'unlock',
        component: UnlockScreen
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
