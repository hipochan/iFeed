/// <reference path="main.ts"/>
/// <reference path="models/messenger.ts"/>
var iFeed;
(function (iFeed) {
    var Dispatcher = (function () {
        function Dispatcher() {
        }
        Dispatcher.prototype.accept = function () {
            chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
                switch (message.command) {
                    case 'GetLayoutRequest':
                        iFeed.messenger.sendResponse('GetLayoutResponsse', true, '', iFeed.layout.LayoutData);
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
            });
        };
        return Dispatcher;
    }());
    iFeed.Dispatcher = Dispatcher;
})(iFeed || (iFeed = {}));
//# sourceMappingURL=dispatcher.js.map