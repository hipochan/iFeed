var iFeed;
(function (iFeed) {
    var Models;
    (function (Models) {
        var I18n = (function () {
            function I18n() {
            }
            I18n.getMessage = function (keyword) { return chrome.i18n.getMessage(keyword); };
            return I18n;
        }());
        Models.I18n = I18n;
    })(Models = iFeed.Models || (iFeed.Models = {}));
})(iFeed || (iFeed = {}));
//# sourceMappingURL=i18n.js.map