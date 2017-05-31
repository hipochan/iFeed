/// <reference path="storage.ts"/>
/// <reference path="messenger.ts"/>
/// <reference path="i18n.ts"/>

module iFeed.Models {
    var undefined;

    export interface IFeeds {
        feedSeq: number;
        feeds: IFeed[];
    }

    export interface IFeed {
        feedId: number;
        url: string;
        title: string;
        link: string;
        lastUpdate: string;
        data?: IFeedItem[];
    }

    export interface IFeedItem {
        title: string;
        link: string;
        date: string;
        description?: string;
    }

    export class Feed extends Storage {
        public FeedData: IFeeds = {
            feedSeq: 0,
            feeds: []
        };

        public load = (): void => {
            this.getData('feed', (result) => {
                if (result.feed !== undefined) {
                    this.FeedData = result.feed;

                    // データ不整合修正(枠ありデータなし)
                    let layoutFixed: boolean = false;
                    for (let i = iFeed.layout.LayoutData.length - 1; i >= 0; i--) {
                        let found: boolean = false;
                        for (let j = 0; j < this.FeedData.feeds.length; j++) {
                            if (iFeed.layout.LayoutData[i].feedId == this.FeedData.feeds[j].feedId) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            iFeed.layout.LayoutData.splice(i, 1);
                            layoutFixed = true;
                        }
                    }
                    if (layoutFixed) iFeed.layout.save();

                    // データ不整合修正(データあり枠なし)
                    for (let i = this.FeedData.feeds.length - 1; i >= 0 ; i--) {
                        let found: boolean = false;
                        for (let j = 0; j < iFeed.layout.LayoutData.length; j++) {
                            if (this.FeedData.feeds[i].feedId == iFeed.layout.LayoutData[j].feedId) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            this.FeedData.feeds.splice(i, 1);
                        }
                    }
                }
                this.save(() => mainWindow.load());
            });
        }

        public save = (callback?: Function): void => {
            if (typeof callback !== 'function') callback = function () { };

            var storage: Storage = new Storage();

            storage.setData({ feed: this.FeedData }, callback);
        }

        private getNextFeedSeq = (): number => {
            return ++this.FeedData.feedSeq;
        }
        
        private isFeedData = (data: any): boolean => {
            if ($('item', data).length < 1 && $('entry', data).length < 1) {
                return false;
            }
            return true;
        }

        private getFeedTitle = (data: any): string => {
            var title: string = '';

            if ($('channel > title', data).length > 0) {
                title = $('channel > title', data).text();
            }
            else if ($('feed > title', data).length > 0) {
                title = $('feed > title', data).text();
            }

            return title;
        }

        private getFeedLink = (data: any): string => {
            var link: string = '';

            if ($('channel > link', data).length > 0) {
                link = $('channel > link', data).text();
            }
            else if ($('feed > link[rel=alternate]', data).length > 0) {
                link = $('feed > link[rel=alternate]', data).attr('href');
            }

            return link;
        }

        private getFeedDetailData = (data: any): IFeedItem[] => {
            var feedItems: IFeedItem[] = [];

            if ($('item', data).length > 0) {
                $('item', data).each(function () {
                    var feedItem: IFeedItem = {
                        title: '',
                        link: '',
                        date: '',
                        description: ''
                    };

                    feedItem.title = $('title', this).text();
                    feedItem.link = $('link', this).text();
                    if ($('pubDate', this).length > 0) {
                        feedItem.date = new Date($('pubDate', this).text()).toLocaleString();
                    }
                    else if ($(this).find('date, dc\\:date').length > 0) {
                        feedItem.date = new Date($(this).find('date, dc\\:date').text()).toLocaleString();
                    }
                    if ($('description', this).length > 0) {
                        feedItem.description = $('description', this).text();
                    }
                    feedItems.push(feedItem);
                });
            }
            else if ($('entry', data).length > 0) {
                $('entry', data).each(function () {
                    var feedItem: IFeedItem = {
                        title: '',
                        link: '',
                        date: '',
                        description: ''
                    };

                    feedItem.title = $('title', this).text();
                    feedItem.link = $('link', this).attr('href');
                    if ($('updated', this).length > 0) {
                        feedItem.date = new Date($('updated', this).text()).toLocaleString();
                    }
                    else if ($('published', this).length > 0) {
                        feedItem.date = new Date($('published', this).text()).toLocaleString();
                    }
                    else if ($('modified', this).length > 0) {
                        feedItem.date = new Date($('modified', this).text()).toLocaleString();
                    }
                    else if ($('created', this).length > 0) {
                        feedItem.date = new Date($('created', this).text()).toLocaleString();
                    }
                    if ($('summary', this).length > 0) {
                        feedItem.description = $('summary', this).text();
                    }
                    feedItems.push(feedItem);
                });
            }

            return feedItems;
        }

        public addFeed = (url: string): void => {
            $.ajax({
                dataType: 'xml',
                url: url,
                success: (data): any => {
                    if (!this.isFeedData(data)) {
                        messenger.sendResponse('AddFeedResponse', false, I18n.getMessage('errInvalidFeedURL'));
                        return false;
                    }

                    var title: string = this.getFeedTitle(data);
                    if (title == "") {
                        messenger.sendResponse('AddFeedResponse', false, I18n.getMessage('errInvalidFeedURL'));
                        return false;
                    }

                    var link: string = this.getFeedLink(data);

                    var feedItems: IFeedItem[] = feedItems = this.getFeedDetailData(data);
                    var feedId: number = this.getNextFeedSeq();
                    this.FeedData.feeds.push(
                        {
                            feedId: feedId,
                            url: url,
                            title: title,
                            link: link,
                            lastUpdate: new Date().toDateString(),
                            data: feedItems
                        }
                    );

                    messenger.sendResponse('AddFeedResponse', true);
                    this.save(() => layout.addFeedContent(feedId));

                },
                error: (data: any) => {
                    messenger.sendResponse('AddFeedResponse', false, I18n.getMessage('errInvalidFeedURL'));
                }
            });
        }

        public removeFeed = (feedId: number): void => {
            var index: number = this.getFeedIndex(feedId);

            this.FeedData.feeds.splice(index, 1);

            this.save(() => layout.removeFeedContent(feedId));
        }
        
        private getFeedIndex = (feedId: number): number => {
            for (var i = 0; i < this.FeedData.feeds.length; i++) {
                if (this.FeedData.feeds[i].feedId == feedId) {
                    return i;
                }
            }
            return null;
        }

        public updateFeeds = (): void => {
            for (var i: number = 0; i < this.FeedData.feeds.length; i++) {
                this.updateFeed(this.FeedData.feeds[i].feedId);
            }
        }

        public updateFeed = (feedId: number): void => {
            var index: number = this.getFeedIndex(feedId);
            if (index === null) return;

            var feed: IFeed = this.FeedData.feeds[index];

            $.ajax({
                dataType: 'xml',
                url: this.FeedData.feeds[index].url,
                success: (data): any => {
                    var feed: IFeed = this.FeedData.feeds[index];

                    if (!this.isFeedData(data)) {
                        messenger.sendResponse('UpdateFeedResponse', false, I18n.getMessage('errFeedUpdateFailed') + ' [feed.title]');
                        return false;
                    }

                    var title: string = this.getFeedTitle(data);

                    if (title == "") {
                        messenger.sendResponse('UpdateFeedResponse', false, I18n.getMessage('errFeedUpdateFailed') + ' [feed.title]');
                        return false;
                    }
                    feed.title = title;

                    var link: string = this.getFeedLink(data);
                    feed.link = link;

                    var feedItems: IFeedItem[] = feedItems = this.getFeedDetailData(data);

                    feed.data = feedItems;
                    feed.lastUpdate = new Date().toLocaleString();

                    this.save((): void => this.getFeedData(feedId));
                },
                error: (data: any) => {
                    messenger.sendResponse('UpdateFeedResponse', false, I18n.getMessage('errFeedUpdateFailed') + ' [feed.title]');
                }
            });
        }

        public getFeedData = (feedId: number): void => {
            var index: number = this.getFeedIndex(feedId);
            if (index === null) return;

            messenger.sendResponse('GetFeedResponse', true, '', this.FeedData.feeds[index]);
        }
    }
}
