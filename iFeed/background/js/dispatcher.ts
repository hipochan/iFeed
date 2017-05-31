/// <reference path="main.ts"/>
/// <reference path="models/messenger.ts"/>

module iFeed {
    export class Dispatcher {
        public accept() {
            chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
                switch (message.command) {
                    case 'GetLayoutRequest':
                        messenger.sendResponse('GetLayoutResponsse', true, '', layout.LayoutData);
                        break;
                    case 'AddFeedRequest':
                        feed.addFeed(message.detail);
                        break;
                    case 'RemoveFeedRequest':
                        feed.removeFeed(message.detail);
                        break;
                    case 'GetFeedRequest':
                        feed.getFeedData(message.detail);
                        break;
                    case 'UpdateFeedsRequest':
                        feed.updateFeeds();
                        break;
                    case 'SortFeedRequest':
                        layout.sortFeed(message.detail);
                        break;
                }
            });
        }
    }
}

