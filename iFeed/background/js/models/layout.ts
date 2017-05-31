/// <reference path="storage.ts"/>
/// <reference path="messenger.ts"/>

module iFeed.Models {
    var undefined;

    export enum LayoutType {
        feed = 0
    }

    export interface ILayout {
        itemType: LayoutType;
        feedId: number;
    }

    export class Layout extends Storage {
        public LayoutData: ILayout[] = []

        public load = (): void => {
            this.getData('layout', (result) => {
                if (result.layout !== undefined) {
                    this.LayoutData = result.layout;
                }
                this.save(() => feed.load());
            });
        }

        public save = (callback?: Function): void => {
            if (typeof callback !== 'function') callback = function () { };

            var storage: Storage = new Storage();

            storage.setData({ layout: this.LayoutData }, callback);
        }
        
        private getLayoutIndexFromFeedId = (feedId: number): number => {
            for (var i: number = 0; i < this.LayoutData.length; i++) {
                if (this.LayoutData[i].itemType == 0 && this.LayoutData[i].feedId == feedId) {
                    return i;
                }
            }
            return null;
        }

        public addFeedContent = (feedId: number): void => {
            this.LayoutData.push({
                itemType: 0,
                feedId: feedId
            });
            this.save((): void => messenger.sendResponse('GetLayoutResponsse', true, '', layout.LayoutData));
        }

        public removeFeedContent = (feedId: number): void => {
            var index: number = this.getLayoutIndexFromFeedId(feedId);
            if (index != null) {
                this.LayoutData.splice(index, 1);
                this.save((): void => messenger.sendResponse('GetLayoutResponsse', true, '', layout.LayoutData));
            }
        }

        public sortFeed = (feedIds: number[]): void => {
            var newLayout: ILayout[] = [];

            for (var i: number = 0; i < feedIds.length; i++) {
                newLayout.push($.extend(true, {}, this.LayoutData[this.getLayoutIndexFromFeedId(feedIds[i])]));
            }
            this.LayoutData = newLayout;
            this.save((): void => messenger.sendResponse('GetLayoutResponsse', true, '', layout.LayoutData));
        }
    }
}
