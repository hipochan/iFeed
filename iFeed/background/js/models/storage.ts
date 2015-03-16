module iFeed.Models {
    export interface IStorage {
        getData(key, callback?);
        setData(items, callback?);
    }

    export class Storage implements IStorage {
        /**
         * storageからデータを取得し、終了をコールバックする
         * 
         * @param key      取得するキー
         * @param callback 取得後に実行される処理
         */
        public getData = (key: string, callback?: Function) => {
            if (typeof callback !== 'function') callback = function () { };
            chrome.storage.local.get(key, (result) => callback(result));
        }

        /**
         * storageへデータをセットし、終了をコールバックする
         * 
         * @param items    セットする値 {key: value}
         * @param callback セット後に実行される処理
         */
        public setData = (items, callback?: Function) => {
            if (typeof callback !== 'function') callback = function () { };
            chrome.storage.local.set(items, () => callback());
        }
    }
}
