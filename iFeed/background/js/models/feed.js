/// <reference path="storage.ts"/>
/// <reference path="messenger.ts"/>
/// <reference path="i18n.ts"/>
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
        var Feed = (function (_super) {
            __extends(Feed, _super);
            function Feed() {
                var _this = this;
                _super.apply(this, arguments);
                this.FeedData = {
                    feedSeq: 0,
                    feeds: []
                };
                this.load = function () {
                    _this.getData('feed', function (result) {
                        if (result.feed !== undefined) {
                            _this.FeedData = result.feed;
                            // データ不整合修正(枠ありデータなし)
                            var layoutFixed = false;
                            for (var i = iFeed.layout.LayoutData.length - 1; i >= 0; i--) {
                                var found = false;
                                for (var j = 0; j < _this.FeedData.feeds.length; j++) {
                                    if (iFeed.layout.LayoutData[i].feedId == _this.FeedData.feeds[j].feedId) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    iFeed.layout.LayoutData.splice(i, 1);
                                    layoutFixed = true;
                                }
                            }
                            if (layoutFixed)
                                iFeed.layout.save();
                            // データ不整合修正(データあり枠なし)
                            for (var i = _this.FeedData.feeds.length - 1; i >= 0; i--) {
                                var found = false;
                                for (var j = 0; j < iFeed.layout.LayoutData.length; j++) {
                                    if (_this.FeedData.feeds[i].feedId == iFeed.layout.LayoutData[j].feedId) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    _this.FeedData.feeds.splice(i, 1);
                                }
                            }
                        }
                        _this.save(function () { return iFeed.mainWindow.load(); });
                    });
                };
                this.save = function (callback) {
                    if (typeof callback !== 'function')
                        callback = function () { };
                    var storage = new Models.Storage();
                    storage.setData({ feed: _this.FeedData }, callback);
                };
                this.getNextFeedSeq = function () {
                    return ++_this.FeedData.feedSeq;
                };
                this.isFeedData = function (data) {
                    if ($('item', data).length < 1 && $('entry', data).length < 1) {
                        return false;
                    }
                    return true;
                };
                this.getFeedTitle = function (data) {
                    var title = '';
                    if ($('channel > title', data).length > 0) {
                        title = $('channel > title', data).text();
                    }
                    else if ($('feed > title', data).length > 0) {
                        title = $('feed > title', data).text();
                    }
                    return title;
                };
                this.getFeedLink = function (data) {
                    var link = '';
                    if ($('channel > link', data).length > 0) {
                        link = $('channel > link', data).text();
                    }
                    else if ($('feed > link[rel=alternate]', data).length > 0) {
                        link = $('feed > link[rel=alternate]', data).attr('href');
                    }
                    return link;
                };
                this.getFeedDetailData = function (data) {
                    var feedItems = [];
                    if ($('item', data).length > 0) {
                        $('item', data).each(function () {
                            var feedItem = {
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
                            var feedItem = {
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
                };
                this.addFeed = function (url) {
                    $.ajax({
                        dataType: 'xml',
                        url: url,
                        success: function (data) {
                            if (!_this.isFeedData(data)) {
                                iFeed.messenger.sendResponse('AddFeedResponse', false, Models.I18n.getMessage('errInvalidFeedURL'));
                                return false;
                            }
                            var title = _this.getFeedTitle(data);
                            if (title == "") {
                                iFeed.messenger.sendResponse('AddFeedResponse', false, Models.I18n.getMessage('errInvalidFeedURL'));
                                return false;
                            }
                            var link = _this.getFeedLink(data);
                            var feedItems = feedItems = _this.getFeedDetailData(data);
                            var feedId = _this.getNextFeedSeq();
                            _this.FeedData.feeds.push({
                                feedId: feedId,
                                url: url,
                                title: title,
                                link: link,
                                lastUpdate: new Date().toDateString(),
                                data: feedItems
                            });
                            iFeed.messenger.sendResponse('AddFeedResponse', true);
                            _this.save(function () { return iFeed.layout.addFeedContent(feedId); });
                        },
                        error: function (data) {
                            iFeed.messenger.sendResponse('AddFeedResponse', false, Models.I18n.getMessage('errInvalidFeedURL'));
                        }
                    });
                };
                this.removeFeed = function (feedId) {
                    var index = _this.getFeedIndex(feedId);
                    _this.FeedData.feeds.splice(index, 1);
                    _this.save(function () { return iFeed.layout.removeFeedContent(feedId); });
                };
                this.getFeedIndex = function (feedId) {
                    for (var i = 0; i < _this.FeedData.feeds.length; i++) {
                        if (_this.FeedData.feeds[i].feedId == feedId) {
                            return i;
                        }
                    }
                    return null;
                };
                this.updateFeeds = function () {
                    for (var i = 0; i < _this.FeedData.feeds.length; i++) {
                        _this.updateFeed(_this.FeedData.feeds[i].feedId);
                    }
                };
                this.updateFeed = function (feedId) {
                    var index = _this.getFeedIndex(feedId);
                    if (index === null)
                        return;
                    var feed = _this.FeedData.feeds[index];
                    $.ajax({
                        dataType: 'xml',
                        url: _this.FeedData.feeds[index].url,
                        success: function (data) {
                            var feed = _this.FeedData.feeds[index];
                            if (!_this.isFeedData(data)) {
                                iFeed.messenger.sendResponse('UpdateFeedResponse', false, Models.I18n.getMessage('errFeedUpdateFailed') + ' [feed.title]');
                                return false;
                            }
                            var title = _this.getFeedTitle(data);
                            if (title == "") {
                                iFeed.messenger.sendResponse('UpdateFeedResponse', false, Models.I18n.getMessage('errFeedUpdateFailed') + ' [feed.title]');
                                return false;
                            }
                            feed.title = title;
                            var link = _this.getFeedLink(data);
                            feed.link = link;
                            var feedItems = feedItems = _this.getFeedDetailData(data);
                            feed.data = feedItems;
                            feed.lastUpdate = new Date().toLocaleString();
                            _this.save(function () { return _this.getFeedData(feedId); });
                        },
                        error: function (data) {
                            iFeed.messenger.sendResponse('UpdateFeedResponse', false, Models.I18n.getMessage('errFeedUpdateFailed') + ' [feed.title]');
                        }
                    });
                };
                this.getFeedData = function (feedId) {
                    var index = _this.getFeedIndex(feedId);
                    if (index === null)
                        return;
                    iFeed.messenger.sendResponse('GetFeedResponse', true, '', _this.FeedData.feeds[index]);
                };
            }
            return Feed;
        }(Models.Storage));
        Models.Feed = Feed;
    })(Models = iFeed.Models || (iFeed.Models = {}));
})(iFeed || (iFeed = {}));
//# sourceMappingURL=feed.js.map