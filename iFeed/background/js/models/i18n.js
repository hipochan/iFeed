var iFeed;
(function (iFeed) {
    (function (Models) {
        var I18n = (function () {
            function I18n() {
            }
            I18n.getMessage = function (keyword) {
                return chrome.i18n.getMessage(keyword);
            };
            return I18n;
        })();
        Models.I18n = I18n;
    })(iFeed.Models || (iFeed.Models = {}));
    var Models = iFeed.Models;
})(iFeed || (iFeed = {}));
//# sourceMappingURL=i18n.js.map
