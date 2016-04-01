/// <reference path="models/config.ts"/>
/// <reference path="models/layout.ts"/>
/// <reference path="models/feed.ts"/>
var iFeed;
(function (iFeed) {
    var MainWindow = (function () {
        function MainWindow() {
            var _this = this;
            this.appWindow = null;
            // Appウィンドウの生成
            this.load = function () {
                if (_this.appWindow) {
                    _this.appWindow.focus();
                }
                else {
                    chrome.app.window.create('html/app.html', {
                        id: 'iFeed',
                        outerBounds: {
                            width: iFeed.config.ConfigData.AppWindow.width,
                            height: iFeed.config.ConfigData.AppWindow.height,
                            left: iFeed.config.ConfigData.AppWindow.left,
                            top: iFeed.config.ConfigData.AppWindow.top
                        }
                    }, function (appWindow) {
                        _this.appWindow = appWindow;
                        if (!_this.appWindow.contentWindow)
                            return false;
                        _this.appWindow.onClosed.addListener(function () { return _this.appWindow = null; });
                        _this.appWindow.contentWindow.addEventListener('resize', function () { return _this.resize(); }, false);
                        $(_this.appWindow.contentWindow).trigger('resize');
                        _this.appWindow.contentWindow.addEventListener('contextmenu', function (event) {
                            var target = event.target;
                            var type = $(target).attr('type') === undefined ? '' : $(target).attr('type').toLowerCase();
                            if (type != 'text' && type != 'url' && type != 'search') {
                                event.preventDefault();
                                return false;
                            }
                            else {
                                return true;
                            }
                        });
                        setInterval(function () { return iFeed.feed.updateFeeds(); }, 1000 * iFeed.config.ConfigData.Feed.updateInterval);
                        iFeed.feed.updateFeeds();
                        return true;
                    });
                }
            };
            // Appウィンドウのリサイズ
            this.resize = function () {
                iFeed.config.ConfigData.AppWindow.width = _this.appWindow.outerBounds.width;
                iFeed.config.ConfigData.AppWindow.height = _this.appWindow.outerBounds.height;
                iFeed.config.ConfigData.AppWindow.left = _this.appWindow.outerBounds.left;
                iFeed.config.ConfigData.AppWindow.top = _this.appWindow.outerBounds.top;
                iFeed.config.save();
            };
        }
        return MainWindow;
    })();
    iFeed.MainWindow = MainWindow;
    iFeed.messenger = new iFeed.Models.Messenger();
    iFeed.config = new iFeed.Models.Config();
    iFeed.layout = new iFeed.Models.Layout();
    iFeed.feed = new iFeed.Models.Feed();
    iFeed.mainWindow = new MainWindow();
    chrome.app.runtime.onLaunched.addListener(function (launchData) {
        var dispatcher = new iFeed.Dispatcher();
        dispatcher.accept();
        iFeed.config.load();
    });
})(iFeed || (iFeed = {}));
//# sourceMappingURL=main.js.map