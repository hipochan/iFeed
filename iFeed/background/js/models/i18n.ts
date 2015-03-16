module iFeed.Models {
    export class I18n {
        public static getMessage = (keyword: string): string => chrome.i18n.getMessage(keyword);
    }
} 