var iFeed;
(function (iFeed) {
    var Models;
    (function (Models) {
        var Storage = (function () {
            function Storage() {
                /**
                 * storageからデータを取得し、終了をコールバックする
                 *
                 * @param key      取得するキー
                 * @param callback 取得後に実行される処理
                 */
                this.getData = function (key, callback) {
                    if (typeof callback !== 'function')
                        callback = function () { };
                    chrome.storage.local.get(key, function (result) { return callback(result); });
                };
                /**
                 * storageへデータをセットし、終了をコールバックする
                 *
                 * @param items    セットする値 {key: value}
                 * @param callback セット後に実行される処理
                 */
                this.setData = function (items, callback) {
                    if (typeof callback !== 'function')
                        callback = function () { };
                    chrome.storage.local.set(items, function () { return callback(); });
                };
            }
            return Storage;
        })();
        Models.Storage = Storage;
    })(Models = iFeed.Models || (iFeed.Models = {}));
})(iFeed || (iFeed = {}));
//# sourceMappingURL=storage.js.map