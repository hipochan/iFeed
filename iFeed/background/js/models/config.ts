module iFeed.Models {
    var undefined;

    export class Config extends Storage {
        public ConfigData = {
            AppWindow: {
                left: 0,
                top: 0,
                width: 800,
                height: 500
            },
            Feed: {
                updateInterval: 900
            }
        }

        public load = (): void => {
            this.getData('config', (result) => {
                var screenWidth: number = screen.availWidth;
                var screenHeight: number = screen.availHeight;
                this.ConfigData.AppWindow.left = (screenWidth - this.ConfigData.AppWindow.width) / 2;
                this.ConfigData.AppWindow.top = (screenHeight - this.ConfigData.AppWindow.height) / 2;

                if (result !== undefined && result.config !== undefined) {
                    if (result.config.AppWindow !== undefined) {
                        $.each(result.config.AppWindow, (propertyName, value) => {
                            this.ConfigData.AppWindow[propertyName] = value;
                        });
                    }
                    if (result.config.Feed !== undefined) {
                        $.each(result.config.Feed, (propertyName, value) => {
                            this.ConfigData.Feed[propertyName] = value;
                        });
                    }
                }
                this.save(() => messenger.sendRequest(MessageDirection.backend, 'ConfigLoaded'));
            });
        }

        public save = (callback?: Function): void => {
            if (typeof callback !== 'function') callback = function () { };

            var storage = new Storage();

            storage.setData({ config: this.ConfigData }, callback);
        }
    }
}
