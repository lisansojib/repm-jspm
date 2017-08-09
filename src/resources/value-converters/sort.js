import {stringComparisonOrdinalIgnoreCase, dateComparison} from 'resources/value-converters/util';

export class SortValueConverter {
    toView(array, propertyName, direction) {
        //console.log("SortValueConverter "+array.length+" " +propertyName+" "+direction);
        var factor = direction === 'ascending' ? 1 : -1;
        return array.slice(0)
          .sort((a, b) => {          
              if (isNaN(a[propertyName])||isNaN(b[propertyName]))
              {

                  return stringComparisonOrdinalIgnoreCase(a[propertyName],b[propertyName]) * factor;
              }
              else
              {
                  return (a[propertyName] - b[propertyName]) * factor;
              }
          });
    }
}