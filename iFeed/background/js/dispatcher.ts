/// <reference path="main.ts"/>
/// <reference path="models/messenger.ts"/>

module iFeed {
    export class Dispatcher {
        public accept() {
            chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
                var messageType: Models.MessageDirection = Models.MessageDirection.backend;

                if (message.command.split('-')[0] == 'frontend') {
                    messageType = Models.MessageDirection.frontend;
                    message.command = message.command.substr(9);
                    this.frontendMessage(message);
                }
                else if (message.command.split('-')[0] == 'backend') {
                    messageType = Models.MessageDirection.backend;
                    message.command = message.command.substr(8);
                    this.backendMessage(message);
                }
                else {
                    return;
                }

            });
        }

        private backendMessage(message: any) {
            switch (message.command) {
                case 'FeedAdded':
                    layout.addFeedContent(message.detail);
                    break;
                case 'FeedRemoved':
                    layout.removeFeedContent(message.detail);
                    break;
            }
        }

        private frontendMessage(message: any) {
            switch (message.command) {
                case 'GetLayoutRequest':
                    messenger.sendResponse(Models.MessageDirection.frontend, 'GetLayoutResponsse', true, '', layout.LayoutData);
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
        }
    }
}

