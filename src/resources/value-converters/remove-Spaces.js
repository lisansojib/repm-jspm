export class removeSpacesValueConverter {


    toView(value) {
        if (value==null)
            return "";
        return value.replace(" ","").replace("-","");
    }
}
