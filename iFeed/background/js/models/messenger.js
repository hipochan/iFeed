/// <reference path="../main.ts"/>
var iFeed;
(function (iFeed) {
    var Models;
    (function (Models) {
        (function (MessageDirection) {
            MessageDirection[MessageDirection["backend"] = 0] = "backend";
            MessageDirection[MessageDirection["frontend"] = 1] = "frontend";
        })(Models.MessageDirection || (Models.MessageDirection = {}));
        var MessageDirection = Models.MessageDirection;
        var Messenger = (function () {
            function Messenger() {
                var _this = this;
                this.send = function (data) {
                    if (data.direction == MessageDirection.backend) {
                        data.command = 'backend-' + data.command;
                    }
                    else {
                        data.command = 'frontend-' + data.command;
                    }
                    chrome.runtime.sendMessage(data);
                };
                this.sendRequest = function (direction, command, detail) {
                    _this.send({ direction: direction, command: command, detail: detail });
                };
                this.sendResponse = function (direction, command, result, error, detail) {
                    _this.send({ direction: direction, command: command, result: result, error: error, detail: detail });
                };
            }
            return Messenger;
        }());
        Models.Messenger = Messenger;
    })(Models = iFeed.Models || (iFeed.Models = {}));
})(iFeed || (iFeed = {}));
//# sourceMappingURL=messenger.js.map