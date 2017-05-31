/// <reference path="../main.ts"/>

module iFeed.Models {
    export class Messenger {
        private send = (data: any) => {
            chrome.runtime.sendMessage(data);
        }

        public sendResponse = (command: string, result: boolean, error?: string, detail?: any) => {
            this.send({ command: command, result: result, error: error, detail: detail });
        }
    }
}
