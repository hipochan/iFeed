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
        (function (LayoutType) {
            LayoutType[LayoutType["feed"] = 0] = "feed";
        })(Models.LayoutType || (Models.LayoutType = {}));
        var LayoutType = Models.LayoutType;
        var Layout = (function (_super) {
            __extends(Layout, _super);
            function Layout() {
                var _this = this;
                _super.apply(this, arguments);
                this.LayoutData = [];
                this.load = function () {
                    _this.getData('layout', function (result) {
                        if (result.layout !== undefined) {
                            _this.LayoutData = result.layout;
                        }
                        _this.save(function () { return iFeed.feed.load(); });
                    });
                };
                this.save = function (callback) {
                    if (typeof callback !== 'function')
                        callback = function () { };
                    var storage = new Models.Storage();
                    storage.setData({ layout: _this.LayoutData }, callback);
                };
                this.getLayoutIndexFromFeedId = function (feedId) {
                    for (var i = 0; i < _this.LayoutData.length; i++) {
                        if (_this.LayoutData[i].itemType == 0 && _this.LayoutData[i].feedId == feedId) {
                            return i;
                        }
                    }
                    return null;
                };
                this.addFeedContent = function (feedId) {
                    _this.LayoutData.push({
                        itemType: 0,
                        feedId: feedId
                    });
                    _this.save(function () { return iFeed.messenger.sendResponse(Models.MessageDirection.frontend, 'GetLayoutResponsse', true, '', iFeed.layout.LayoutData); });
                };
                this.removeFeedContent = function (feedId) {
                    var index = _this.getLayoutIndexFromFeedId(feedId);
                    if (index != null) {
                        _this.LayoutData.splice(index, 1);
                        _this.save(function () { return iFeed.messenger.sendResponse(Models.MessageDirection.frontend, 'GetLayoutResponsse', true, '', iFeed.layout.LayoutData); });
                    }
                };
                this.sortFeed = function (feedIds) {
                    var newLayout = [];
                    for (var i = 0; i < feedIds.length; i++) {
                        newLayout.push($.extend(true, {}, _this.LayoutData[_this.getLayoutIndexFromFeedId(feedIds[i])]));
                    }
                    _this.LayoutData = newLayout;
                    _this.save(function () { return iFeed.messenger.sendResponse(Models.MessageDirection.frontend, 'GetLayoutResponsse', true, '', iFeed.layout.LayoutData); });
                };
            }
            return Layout;
        }(Models.Storage));
        Models.Layout = Layout;
    })(Models = iFeed.Models || (iFeed.Models = {}));
})(iFeed || (iFeed = {}));
//# sourceMappingURL=layout.js.map