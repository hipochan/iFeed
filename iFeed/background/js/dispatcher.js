/// <reference path="main.ts"/>
/// <reference path="models/messenger.ts"/>
var iFeed;
(function (iFeed) {
    var Dispatcher = (function () {
        function Dispatcher() {
        }
        Dispatcher.prototype.accept = function () {
            var _this = this;
            chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
                var messageType = iFeed.Models.MessageDirection.backend;
                if (message.command.split('-')[0] == 'frontend') {
                    messageType = iFeed.Models.MessageDirection.frontend;
                    message.command = message.command.substr(9);
                    _this.frontendMessage(message);
                }
                else if (message.command.split('-')[0] == 'backend') {
                    messageType = iFeed.Models.MessageDirection.backend;
                    message.command = message.command.substr(8);
                    _this.backendMessage(message);
                }
                else {
                    return;
                }
            });
        };
        Dispatcher.prototype.backendMessage = function (message) {
            //            switch (message.command) {
            //                case 'FeedAdded':
            //                    layout.addFeedContent(message.detail);
            //                    break;
            //                case 'FeedRemoved':
            //                    layout.removeFeedContent(message.detail);
            //                    break;
            //            }
        };
        Dispatcher.prototype.frontendMessage = function (message) {
            switch (message.command) {
                case 'GetLayoutRequest':
                    iFeed.messenger.sendResponse(iFeed.Models.MessageDirection.frontend, 'GetLayoutResponsse', true, '', iFeed.layout.LayoutData);
                    break;
                case 'AddFeedRequest':
                    iFeed.feed.addFeed(message.detail);
                    break;
                case 'RemoveFeedRequest':
                    iFeed.feed.removeFeed(message.detail);
                    break;
                case 'GetFeedRequest':
                    iFeed.feed.getFeedData(message.detail);
                    break;
                case 'UpdateFeedsRequest':
                    iFeed.feed.updateFeeds();
                    break;
                case 'SortFeedRequest':
                    iFeed.layout.sortFeed(message.detail);
                    break;
            }
        };
        return Dispatcher;
    }());
    iFeed.Dispatcher = Dispatcher;
})(iFeed || (iFeed = {}));
//# sourceMappingURL=dispatcher.js.map