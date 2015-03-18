var iFeed;
(function (iFeed) {
    (function (Frontend) {
        var undefined;

        var App = (function () {
            function App() {
                var _this = this;
                this.getMessage = function (keyword) {
                    return chrome.i18n.getMessage(keyword);
                };
                this.sendMessage = function (command, detail) {
                    command = 'frontend-' + command;
                    chrome.runtime.sendMessage({ command: command, detail: detail });
                };
                this.initialize = function () {
                    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
                        var command = message.command;

                        if (command.split('-')[0] != 'frontend')
                            return;

                        command = command.substr(9);
                        switch (command) {
                            case 'AddFeedResponse':
                                _this.addFeedResponse(message);
                                break;
                            case 'GetLayoutResponsse':
                                _this.getLayoutResponse(message);
                                break;
                            case 'GetFeedResponse':
                                _this.getFeedResponse(message);
                                break;
                        }
                    });

                    var self = _this;
                    $('[data-i18n]').each(function () {
                        var $element = $(this);

                        if (this.tagName.toLowerCase() == 'html') {
                            $element.attr('lang', self.getMessage($element.data('i18n')));
                        } else if (this.type == 'search') {
                            $element.attr('placeholder', self.getMessage($element.data('i18n')));
                        } else {
                            $element.text(self.getMessage($element.data('i18n')));
                        }
                    });

                    $('#addFeed').on('show.bs.modal', function () {
                        return _this.openAddFeedWindow();
                    });
                    $('#addFeed').on('shown.bs.modal', function () {
                        return _this.openedAddFeedWindow();
                    });
                    $('#addFeed').on('hidden.bs.modal', function () {
                        setTimeout(function () {
                            return $('#add_feed').blur();
                        }, 10);
                    });
                    $('#reload_button').on('click', function () {
                        _this.sendMessage('UpdateFeedsRequest');
                    });
                    $('#content').on('click', '.remove_feed', function (event) {
                        var id = event.target.id.split('-')[1];
                        _this.sendMessage('RemoveFeedRequest', id);
                    });
                    $('#add_feed_window_submit').on('click', function () {
                        return _this.addFeedSubmit();
                    });

                    $('#content').html('');
                    $('#content').sortable({
                        handle: '.feed-title',
                        update: function (event, ui) {
                            return _this.feedSorted();
                        }
                    });

                    $('#search_text').autocomplete({
                        source: function (request, response) {
                            var lang = _this.getMessage('html');
                            $.ajax({
                                url: "http://www.google.com/complete/search",
                                data: { hl: lang, client: 'firefox', q: request.term },
                                dataType: "json",
                                type: "GET",
                                success: function (data) {
                                    return response(data[1]);
                                }
                            });
                        },
                        delay: 300
                    });

                    _this.sendMessage('GetLayoutRequest');
                };
                this.escapeHTML = function (value) {
                    value = value.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
                    value = $('<div />').text(value).html();
                    var len = value.length;
                    if (len > 200) {
                        value = value.substr(0, 200) + '...';
                    }
                    return value;
                };
                this.convertDateTimeFormat = function (value) {
                    var pubDate = new Date(value);
                    var now = new Date();

                    if (pubDate.getFullYear() == now.getFullYear() && pubDate.getMonth() == now.getMonth() && pubDate.getDate() == now.getDate()) {
                        return ('0' + pubDate.getHours()).slice(-2) + ':' + ('0' + pubDate.getMinutes()).slice(-2);
                    } else if (pubDate.getFullYear() == now.getFullYear()) {
                        return (pubDate.getMonth() + 1) + '/' + pubDate.getDate() + ' ' + ('0' + pubDate.getHours()).slice(-2) + ':' + ('0' + pubDate.getMinutes()).slice(-2);
                    } else {
                        return pubDate.getFullYear() + '/' + (pubDate.getMonth() + 1) + '/' + pubDate.getDate();
                    }
                };
                this.openAddFeedWindow = function () {
                    $('#add_feed_text_form_group_error_label').hide();
                    $('#add_feed_text_form_group').removeClass('has-error');
                    $('#add_feed_text').val('');
                };
                this.openedAddFeedWindow = function () {
                    $('#add_feed_text').focus();
                };
                this.addFeedSubmit = function () {
                    var feedURL = $('#add_feed_text').val();

                    var pattern = new RegExp('^(https?:\\/\\/)?' + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + '((\\d{1,3}\\.){3}\\d{1,3}))' + '(\\:\\d+)?(\\/[;&a-z\\d%_.~+=-]*)*' + '(\\?[;&a-z\\d%_.~+=-]*)?' + '(\\#[-a-z\\d_]*)?$', 'i');

                    if (pattern.test(feedURL)) {
                        _this.sendMessage('AddFeedRequest', feedURL);
                    } else {
                        $('#add_feed_text_form_group_error_label').show();
                        $('#add_feed_text_form_group').addClass('has-error');
                        $('#add_feed_text_form_group_error_label').text(_this.getMessage('errInvalidFeedFormat'));
                    }
                };
                this.addFeedResponse = function (message) {
                    if (message.result == false) {
                        $('#add_feed_text_form_group_error_label').show();
                        $('#add_feed_text_form_group').addClass('has-error');
                        $('#add_feed_text_form_group_error_label').text(message.error);
                    } else {
                        $('#addFeed').modal('hide');
                    }
                };
                this.getLayoutResponse = function (message) {
                    _this.showContent(message.detail);
                };
                this.showContent = function (feeds) {
                    $('#content').html('');

                    for (var i = 0; i < feeds.length; i++) {
                        var feedId = feeds[i].feedId;

                        $('#content').append('<div class="feed col-sm-6 col-md-4 col-lg-3" id="feed-' + feedId + '" />');

                        _this.sendMessage('GetFeedRequest', feedId);
                    }
                };
                this.getFeedResponse = function (message) {
                    var self = _this;
                    var feed = message.detail;
                    var feedId = feed.feedId;
                    var title = feed.title;
                    var link = feed.link;
                    var item = feed.data;
                    var feedHTML = '';

                    $('[data-toggle="tooltip"]').tooltip('destroy');

                    feedHTML += '<div class="panel panel-default">\n';
                    feedHTML += '	<div class="panel-heading clearfix">\n';
                    feedHTML += '		<div class="feed-icon text-right">\n';
                    feedHTML += '		    <div class="dropdown">\n';
                    feedHTML += '			    <button id="feed_menu-' + feedId + '" type="button" class="feed_menu btn btn-default" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n';
                    feedHTML += '				    <span class="glyphicon glyphicon-menu-hamburger"></span>\n';
                    feedHTML += '			    </button>\n';
                    feedHTML += '			    <ul class="dropdown-menu left" role="menu" aria-labelledby="feed_menu-' + feedId + '">\n';
                    feedHTML += '			        <li><a id="remove_feed-' + feedId + '" class="remove_feed menuitem">' + _this.getMessage('feedMenuRemove') + '</a></li>\n';
                    feedHTML += '			    </ul>\n';
                    feedHTML += '		    </div>\n';
                    feedHTML += '		</div>\n';
                    if (link !== undefined && link != '') {
                        feedHTML += '		<div class="feed-title"><a href="' + _this.escapeHTML(link).replace(/\"/g, '\\"') + '" target="_blank">' + _this.escapeHTML(title) + '</a></div>\n';
                    } else {
                        feedHTML += '		<div class="feed-title">' + _this.escapeHTML(title) + '</div>\n';
                    }
                    feedHTML += '	</div>\n';
                    feedHTML += '	<ul class="list-group"></ul>\n';
                    feedHTML += '</div>\n';

                    $('#feed-' + feedId).html(feedHTML);

                    var dateCompare = function (a, b) {
                        if (new Date(a.date) > new Date(b.date)) {
                            return -1;
                        } else if (new Date(a.date) < new Date(b.date)) {
                            return 1;
                        }
                        return 0;
                    };
                    item.sort(dateCompare);

                    $(item).each(function () {
                        var item = this;
                        var feedItemHTML = '';

                        if (item.date !== '') {
                            item.date = self.convertDateTimeFormat(item.date);
                        } else {
                            item.date = '-';
                        }

                        var link = self.escapeHTML(item.link).replace(/\"/g, '\\"');

                        if (item.description !== '') {
                            var description = self.escapeHTML(item.description).replace(/\"/g, '\\"');

                            feedItemHTML += '<li class="list-group-item clearfix" data-toggle="tooltip" data-placement="auto right" title="' + description + '">\n';
                        } else {
                            feedItemHTML += '<li class="list-group-item clearfix">\n';
                        }
                        feedItemHTML += '    <div class="pull-right text-right text-muted feed_datetime">' + self.escapeHTML(item.date) + '</div>\n';
                        feedItemHTML += '    <div class="pull-right feed_item">\n';
                        feedItemHTML += '        <a href="' + link + '" target="_blank">' + self.escapeHTML(item.title) + '</a>\n';
                        feedItemHTML += '    </div>\n';
                        feedItemHTML += '</li>\n';

                        $('#feed-' + feedId + ' .list-group').append(feedItemHTML);
                    });

                    $('[data-toggle="tooltip"]').tooltip({
                        animated: 'fade',
                        container: 'body',
                        delay: {
                            'show': 500
                        }
                    });
                };
                this.feedSorted = function () {
                    var feedIds = [];

                    $('#content > div').each(function () {
                        var feedId = this.id.split('-')[1];

                        feedIds.push(feedId);
                    });

                    _this.sendMessage('SortFeedRequest', feedIds);
                };
            }
            return App;
        })();
        Frontend.App = App;
    })(iFeed.Frontend || (iFeed.Frontend = {}));
    var Frontend = iFeed.Frontend;
})(iFeed || (iFeed = {}));
$(function () {
    var app = new iFeed.Frontend.App();
    app.initialize();
});
//# sourceMappingURL=app.js.map
