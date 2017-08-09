/**
* Compares two strings, ignoring case.
*/
export function stringComparisonOrdinalIgnoreCase(a: string, b: string): number {
    if (a === null)
        a = '';
    if (b === null)
        b = '';
    //a = a.toLowerCase();
    //b = b.toLowerCase();
    if (a < b)
        return -1;
    if (a > b)
        return 1;
    return 0;
}

    /**
    * Compares two dates (Date objects or strings).
    */
export function dateComparison(a: any, b: any): number {
    if (a === null)
        a = new Date(1900, 0, 1);
    if (b === null)
        b = new Date(1900, 0, 1);
    return moment(b).diff(moment(a));
}