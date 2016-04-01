/// <reference path="storage.ts"/>
/// <reference path="messenger.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var iFeed;
(function (iFeed) {
    var Models;
    (function (Models) {
        var undefined;
        var Config = (function (_super) {
            __extends(Config, _super);
            function Config() {
                var _this = this;
                _super.apply(this, arguments);
                this.ConfigData = {
                    AppWindow: {
                        left: 0,
                        top: 0,
                        width: 800,
                        height: 500
                    },
                    Feed: {
                        updateInterval: 900
                    }
                };
                this.load = function () {
                    _this.getData('config', function (result) {
                        var screenWidth = screen.availWidth;
                        var screenHeight = screen.availHeight;
                        _this.ConfigData.AppWindow.left = (screenWidth - _this.ConfigData.AppWindow.width) / 2;
                        _this.ConfigData.AppWindow.top = (screenHeight - _this.ConfigData.AppWindow.height) / 2;
                        if (result !== undefined && result.config !== undefined) {
                            if (result.config.AppWindow !== undefined) {
                                $.each(result.config.AppWindow, function (propertyName, value) {
                                    _this.ConfigData.AppWindow[propertyName] = value;
                                });
                            }
                            if (result.config.Feed !== undefined) {
                                $.each(result.config.Feed, function (propertyName, value) {
                                    _this.ConfigData.Feed[propertyName] = value;
                                });
                            }
                        }
                        _this.save(function () { return iFeed.layout.load(); });
                    });
                };
                this.save = function (callback) {
                    if (typeof callback !== 'function')
                        callback = function () { };
                    var storage = new Models.Storage();
                    storage.setData({ config: _this.ConfigData }, callback);
                };
            }
            return Config;
        })(Models.Storage);
        Models.Config = Config;
    })(Models = iFeed.Models || (iFeed.Models = {}));
})(iFeed || (iFeed = {}));
//# sourceMappingURL=config.js.map