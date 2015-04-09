module iFeed.Frontend {
    var undefined;

    export class App {
        private getMessage = (keyword: string): string => chrome.i18n.getMessage(keyword);
        private sendMessage = (command: string, detail?: any) => {
            command = 'frontend-' + command;
            chrome.runtime.sendMessage({ command: command, detail: detail });
        }

        public initialize = (): void => {
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                var command: string = message.command;

                if (command.split('-')[0] != 'frontend') return;

                command = command.substr(9);
                switch (command) {
                    case 'AddFeedResponse':
                        this.addFeedResponse(message);
                        break;
                    case 'GetLayoutResponsse':
                        this.getLayoutResponse(message);
                        break;
                    case 'GetFeedResponse':
                        this.getFeedResponse(message);
                        break;
                }
            });

            var self: App = this;
            $('[data-i18n]').each(function () {
                var $element: any = $(this);

                if (this.tagName.toLowerCase() == 'html') {
                    $element.attr('lang', self.getMessage($element.data('i18n')));
                }
                else if (this.type == 'search') {
                    $element.attr('placeholder', self.getMessage($element.data('i18n')));
                }
                else {
                    $element.text(self.getMessage($element.data('i18n')));
                }
            });

            $('#addFeed').on('show.bs.modal', (): void => this.openAddFeedWindow());
            $('#addFeed').on('shown.bs.modal', (): void => this.openedAddFeedWindow());
            $('#addFeed').on('hidden.bs.modal', (): void => {
                setTimeout((): void => $('#add_feed').blur(), 10);
            });
            $('#reload_button').on('click', (): void => {
                this.sendMessage('UpdateFeedsRequest');
            });
            $('#content').on('click', '.remove_feed', (event: any): void => {
                var id = event.target.id.split('-')[1];
                this.sendMessage('RemoveFeedRequest', id);
            });
            $('#add_feed_window_submit').on('click', (): void => this.addFeedSubmit());

            $('#content').html('');
            $('#content').sortable({
                handle: '.feed-title',
                update: (event: any, ui: any) => this.feedSorted()
            });

            $('#search_text').autocomplete({
                source: (request: any, response: any): void => {
                    var lang: string = this.getMessage('html');
                    $.ajax({
                        url: "http://www.google.com/complete/search",
                        data: { hl: lang, client: 'firefox', q: request.term },
                        dataType: "json",
                        type: "GET",
                        success: (data: any): void => response(data[1])
                    });
                },
                delay: 300
            });

            this.sendMessage('GetLayoutRequest');
        }

        private escapeHTML = (value: string): string => {
            value = value.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
            value = $('<div />').text(value).html();
            var len: number = value.length;
            if (len > 200) {
                value = value.substr(0, 200) + '...';
            }
            return value;
        }

        private convertDateTimeFormat = (value: string): string => {
            var pubDate: Date = new Date(value);
            var now: Date = new Date();

            if (pubDate.getFullYear() == now.getFullYear()
                && pubDate.getMonth() == now.getMonth()
                && pubDate.getDate() == now.getDate()) {
                return ('0' + pubDate.getHours()).slice(-2) + ':' + ('0' + pubDate.getMinutes()).slice(-2);
            }
            else if (pubDate.getFullYear() == now.getFullYear()) {
                return (pubDate.getMonth() + 1) + '/' + pubDate.getDate() + ' ' + ('0' + pubDate.getHours()).slice(-2) + ':' + ('0' + pubDate.getMinutes()).slice(-2);
            }
            else {
                return pubDate.getFullYear() + '/' + (pubDate.getMonth() + 1) + '/' + pubDate.getDate();
            }
        }

        private openAddFeedWindow = (): void => {
            $('#add_feed_text_form_group_error_label').hide();
            $('#add_feed_text_form_group').removeClass('has-error');
            $('#add_feed_text').val('')
        }

        private openedAddFeedWindow = (): void => {
            $('#add_feed_text').focus();
        }

        private addFeedSubmit = (): void => {
            var feedURL: string = $('#add_feed_text').val();

            var pattern: any = new RegExp('^(https?:\\/\\/)?' + // protocol
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
                '(\\:\\d+)?(\\/[;&a-z\\d%_.~+=-]*)*' + // port and path
                '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

            if (pattern.test(feedURL)) {
                this.sendMessage('AddFeedRequest', feedURL);
            }
            else {
                $('#add_feed_text_form_group_error_label').show();
                $('#add_feed_text_form_group').addClass('has-error');
                $('#add_feed_text_form_group_error_label').text(this.getMessage('errInvalidFeedFormat'));
            }
        }

        private addFeedResponse = (message: any): void => {
            if (message.result == false) {
                $('#add_feed_text_form_group_error_label').show();
                $('#add_feed_text_form_group').addClass('has-error');
                $('#add_feed_text_form_group_error_label').text(message.error);
            }
            else {
                $('#addFeed').modal('hide');
            }
        }

        private getLayoutResponse = (message: any): void => {
            this.showContent(message.detail);
        }

        private showContent = (feeds: any): void => {
            $('#content').html('');

            for (var i = 0; i < feeds.length; i++) {
                var feedId = feeds[i].feedId;

                $('#content').append('<div class="feed col-sm-6 col-md-4 col-lg-3" id="feed-' + feedId + '" />');

                this.sendMessage('GetFeedRequest', feedId);
            }
        }

        private getFeedResponse = (message: any): void => {
            var self = this;
            var feed: any = message.detail;
            var feedId: number = feed.feedId;
            var title: string = feed.title;
            var link: string = feed.link;
            var item: any = feed.data;
            var feedHTML: string = '';

            $('[data-toggle="tooltip"]').tooltip('destroy');

            feedHTML += '<div class="panel panel-default">\n';
            feedHTML += '	<div class="panel-heading clearfix">\n';
            feedHTML += '		<div class="feed-icon text-right">\n';
            feedHTML += '		    <div class="dropdown">\n';
            feedHTML += '			    <button id="feed_menu-' + feedId + '" type="button" class="feed_menu btn btn-default" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n';
            feedHTML += '				    <span class="glyphicon glyphicon-menu-hamburger"></span>\n';
            feedHTML += '			    </button>\n';
            feedHTML += '			    <ul class="dropdown-menu left" role="menu" aria-labelledby="feed_menu-' + feedId + '">\n';
            feedHTML += '			        <li><a id="remove_feed-' + feedId + '" class="remove_feed menuitem">' + this.getMessage('feedMenuRemove') + '</a></li>\n';
            feedHTML += '			    </ul>\n';
            feedHTML += '		    </div>\n';
            feedHTML += '		</div>\n';
            if (link !== undefined && link != '') {
                feedHTML += '		<div class="feed-title"><a href="' + this.escapeHTML(link).replace(/\"/g, '\\"') + '" target="_blank">' + this.escapeHTML(title) + '</a></div>\n';
            }
            else {
                feedHTML += '		<div class="feed-title">' + this.escapeHTML(title) + '</div>\n';
            }
            feedHTML += '	</div>\n';
            feedHTML += '	<ul class="list-group"></ul>\n';
            feedHTML += '</div>\n';

            $('#feed-' + feedId).html(feedHTML);

            var dateCompare = (a: any, b: any): number => {
                if (new Date(a.date) > new Date(b.date)) {
                    return -1;
                }
                else if (new Date(a.date) < new Date(b.date)) {
                    return 1;
                }
                return 0;
            }
            item.sort(dateCompare);

            $(item).each(function () {
                var item = this;
                var feedItemHTML: string = '';

                if (item.date !== '') {
                    item.date = self.convertDateTimeFormat(item.date);
                }
                else {
                    item.date = '-';
                }

                var link: string = self.escapeHTML(item.link).replace(/\"/g, '\\"');

                if (item.description !== '') {
                    var description: string = self.escapeHTML(item.description).replace(/\"/g, '\\"');

                    feedItemHTML += '<li class="list-group-item clearfix" data-toggle="tooltip" data-placement="auto right" title="' + description + '">\n';
                }
                else {
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
                trigger: 'hover',
                animated: 'fade',
                container: 'body',
                delay: {
                    'show': 500
                }
            });
        }

        private feedSorted = (): void => {
            var feedIds: number[] = [];

            $('#content > div').each(function () {
                var feedId = this.id.split('-')[1];

                feedIds.push(feedId);
            });

            this.sendMessage('SortFeedRequest', feedIds);
        }
    }
}
$(function () {
    var app: iFeed.Frontend.App = new iFeed.Frontend.App();
    app.initialize();
});
