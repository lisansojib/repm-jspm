export class ListingDetail {
    searchText;
    constructor() {}

    activate(params) {
        this.searchText = params.id;
    }
}