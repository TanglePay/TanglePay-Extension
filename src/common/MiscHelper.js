import bridge from "./bridge"
import { Base } from "@tangle-pay/common"
export const StorageFacade = {
    get: async (key) => {
        console.log('enter storage get', key);
        const value = await bridge.sendToContentScriptGetData(key);
        console.log('storage get', key, value);
        return value;
    },
    set:  (key, value) => {
        console.log('enter storage set', key, value);
        bridge.sendToContentScriptSetData(key, value);
    }
}

export const StorageFacadeDebug = {
    get: async (key) => {
        console.log('enter storage get', key);
        const value = await Base.getLocalData(key);
        console.log('storage get', key, value);
        return value;
    },
    set:  (key, value) => {
        console.log('enter storage set', key, value);
        Base.setLocalData(key, value);
    }
}

        