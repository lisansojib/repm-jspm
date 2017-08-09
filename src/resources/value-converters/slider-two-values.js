export class SliderTwoValuesValueConverter {
    toView(value) {
        return '['+value.MinPrice[0]+','+value.MaxPrice[0]+']';
    }
    fromView(values) {
        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        };
    }
}