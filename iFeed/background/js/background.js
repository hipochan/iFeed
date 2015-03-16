var iHomeApp;
(function (iHomeApp) {
    iHomeApp.message = new iHomeApp.Models.Message();
    iHomeApp.config = new iHomeApp.Models.Config();
    iHomeApp.layout = new iHomeApp.Models.Layout();
    iHomeApp.feed = new iHomeApp.Models.Feed();
    iHomeApp.app = new iHomeApp.Pages.App();

    chrome.app.runtime.onLaunched.addListener(function () {
        var dispatcher = new iHomeApp.Dispatcher();

        dispatcher.accept();
        iHomeApp.message.send('Initialize');
    });
})(iHomeApp || (iHomeApp = {}));
//# sourceMappingURL=background.js.map
