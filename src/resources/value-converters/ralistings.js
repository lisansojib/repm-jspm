export class ralistingsValueConverter {
    toView(value,format) {


       

        if ((value==null)||(value==""))
        {
            return "UV TBD";
        }

        if (value=="Error")
        {
            return "UV N/A";
        }

        if (value=="No")
        {
            return "No";
        }

        var indexOfP = value.indexOf("(");
        var UVName = value.substring(0,indexOfP);
        var UVType = value.substring(indexOfP);

        if (format=='UVREMOVEDESC')
        {
            if (UVType.indexOf("Center")>0)
                return "UC";
            return "UV";
            //return ("<span title='"+UVType+"'>"+UVName+"</span>");
        }  
        if (format=='UVONLYDESC')
        {
            
            return value;
            //return ("<span title='"+UVType+"'>"+UVName+"</span>");
        }  
        return value;
    }
}
