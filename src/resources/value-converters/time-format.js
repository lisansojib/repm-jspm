import moment from 'moment';

export class TimeFormatValueConverter {
    toView(value) {
        return moment(value).format('h:mm:ss a');
    }
}
