declare var chrome;
declare var $;

module iFeed {
    export class MainWindow {
        public appWindow: any = null;

        // Appウィンドウの生成
        public load = (): void => {
            if (this.appWindow) {
                this.appWindow.focus();
            }
            else {
                chrome.app.window.create('html/app.html', {
                    id: 'iFeed',
                    outerBounds: {
                        width: config.ConfigData.AppWindow.width,
                        height: config.ConfigData.AppWindow.height,
                        left: config.ConfigData.AppWindow.left,
                        top: config.ConfigData.AppWindow.top
                    }
                }, (appWindow: any): boolean => {
                    this.appWindow = appWindow;

                    if (!this.appWindow.contentWindow) return false;
                    this.appWindow.onClosed.addListener((): void => this.appWindow = null);
                    this.appWindow.contentWindow.addEventListener('resize', (): void => this.resize(), false);
                    $(this.appWindow.contentWindow).trigger('resize');

                    this.appWindow.contentWindow.addEventListener('contextmenu', (event): boolean => {
                        var target: any = event.target;
                        var type: string = $(target).attr('type') === undefined ? '' : $(target).attr('type').toLowerCase();

                        if (type != 'text' && type != 'url' && type != 'search') {
                            event.preventDefault();
                            return false;
                        }
                        else {
                            return true;
                        }
                    });

                    setInterval((): void => feed.updateFeeds(), 1000 * config.ConfigData.Feed.updateInterval);
                    feed.updateFeeds();

                    return true;
                });
            }
        }

        // Appウィンドウのリサイズ
        private resize = (): void => {
            config.ConfigData.AppWindow.width = this.appWindow.outerBounds.width;
            config.ConfigData.AppWindow.height = this.appWindow.outerBounds.height;
            config.ConfigData.AppWindow.left = this.appWindow.outerBounds.left;
            config.ConfigData.AppWindow.top = this.appWindow.outerBounds.top;
            config.save();
        }
    }

    export var messenger = new Models.Messenger();
    export var config = new Models.Config();
    export var layout = new Models.Layout();
    export var feed = new Models.Feed();
    export var mainWindow = new MainWindow();

    chrome.app.runtime.onLaunched.addListener((launchData): void => {
        var dispatcher = new Dispatcher();

        dispatcher.accept();
        messenger.sendRequest(Models.MessageDirection.backend, 'Initialize');
    });
}
