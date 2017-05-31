/// <reference path="../main.ts"/>
var iFeed;
(function (iFeed) {
    var Models;
    (function (Models) {
        var Messenger = (function () {
            function Messenger() {
                var _this = this;
                this.send = function (data) {
                    chrome.runtime.sendMessage(data);
                };
                this.sendResponse = function (command, result, error, detail) {
                    _this.send({ command: command, result: result, error: error, detail: detail });
                };
            }
            return Messenger;
        }());
        Models.Messenger = Messenger;
    })(Models = iFeed.Models || (iFeed.Models = {}));
})(iFeed || (iFeed = {}));
//# sourceMappingURL=messenger.js.map