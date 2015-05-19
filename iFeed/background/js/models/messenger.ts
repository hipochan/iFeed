/// <reference path="../main.ts"/>

module iFeed.Models {
    export enum MessageDirection {
        backend = 0,
        frontend = 1
    }
    export class Messenger {
        private send = (data: any) => {
            if (data.direction == MessageDirection.backend) {
                data.command = 'backend-' + data.command;
            }
            else {
                data.command = 'frontend-' + data.command;
            }
            chrome.runtime.sendMessage(data);
        }

        public sendRequest = (direction: MessageDirection, command: string, detail?: any) => {
            this.send({ direction: direction, command: command, detail: detail });
        }

        public sendResponse = (direction: MessageDirection, command: string, result: boolean, error?: string, detail?: any) => {
            this.send({ direction: direction, command: command, result: result, error: error, detail: detail });
        }
    }
}
