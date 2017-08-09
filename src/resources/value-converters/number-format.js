import numeral from 'numeral';

export class NumberFormatValueConverter {
    toView(value,format) {
        if (isNaN(value))
            {
            return value;
        }
        if (format=='removezeros')
        {
            return Number(value);
        }
        if (format=='kmbt')
        {
           
            var str ="";
            var num = Number(value);
            var numlength = (""+num).length;

            if (num >= 1000000)
            {
                var n1 = Math.round(num / Math.pow(10, numlength - 3));
                var d1 = n1 /Math.pow(10, 9 - numlength);
                str= (d1 + "M");
            }
            else
                if (num >= 1000)
                {
                    var n1 = Math.round(num / Math.pow(10, numlength - 3));
                    var d1 = n1 / Math.pow(10, 6 - numlength);
                    str= (d1 + "K");
                }
            else
                    str= num;
            return ("$"+str);
   
            
        } else
        {
            return numeral(value).format(format);
        }
    }
}
