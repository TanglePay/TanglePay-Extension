(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@iota/crypto.js')) :
    typeof define === 'function' && define.amd ? define(['exports', '@iota/crypto.js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.IotaPowBrowser = {}, global.IotaCrypto));
})(this, (function (exports, crypto_js) { 'use strict';

    // Copyright 2020 IOTA Stiftung
    /**
     * Browser POW Provider.
     */
    class BrowserPowProvider {
        /**
         * Create a new instance of BrowserPowProvider.
         * @param numCpus The number of cpus, defaults to max CPUs.
         */
        constructor(numCpus) {
            this._numCpus = numCpus !== null && numCpus !== void 0 ? numCpus : window.navigator.hardwareConcurrency;
        }
        /**
         * Perform pow on the block and return the nonce of at least targetScore.
         * @param block The block to process.
         * @param targetScore The target score.
         * @param powInterval The time in seconds that pow should work before aborting.
         * @returns The nonce.
         */
        async pow(block, targetScore, powInterval) {
            const powRelevantData = block.slice(0, -8);
            const powDigest = crypto_js.Blake2b.sum256(powRelevantData);
            const targetZeros = crypto_js.PowHelper.calculateTargetZeros(block, targetScore);
            const chunkSize = BigInt("18446744073709551615") / BigInt(this._numCpus);
            return this.basicPow(powDigest, targetZeros, (chunkSize * BigInt(0)).toString(), powInterval);
        }

        basicPow(powDigest, targetZeros, startIndex, powInterval){
            const nonce = IotaCrypto.PowHelper.performPow(powDigest, targetZeros, startIndex, powInterval).toString();
            return nonce;
        }
        /**
         * Create new instance of the Worker.
         * @returns The Worker.
         */
        async createWorker() {
            const blob = new Blob([
                "(",
                (() => {
                    self.addEventListener("message", e => {
                        importScripts('./crypto.js')
                        const [powDigest, targetZeros, startIndex, powInterval] = [...e.data];
                        const nonce = self.IotaCrypto.PowHelper.performPow(powDigest, targetZeros, startIndex, powInterval).toString();
                        postMessage(nonce);
                    });
                }).toString(),
                ")()"
            ], { type: "application/javascript" });
            //const blobURL = URL.createObjectURL(blob);
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = function (event) {
                    const blobURL = event.target.result;
                    const worker = new Worker(blobURL);
                    resolve(worker);
                };
                reader.readAsDataURL(blob);
            });
            //URL.revokeObjectURL(blobURL);

        }
    }

    exports.BrowserPowProvider = BrowserPowProvider;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
