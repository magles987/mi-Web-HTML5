import { v4 } from "uuid";
//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*class UtilesControllers*/
//
export class UtilesControllers {

    constructor() {}

    /*createIds()*/
    //generar _ids personalizados con base en tiempo para documentos firebase
    public createIds(): string {

        // obtener la fecha en UTC en HEXA,:  
        //obtener la diferencia horaria del dispositivo con respecto al UTC 
        //con el fin de garantizar la misma zona horaria. 
        // getTimezoneOffset() entrega la diferencie en minutos, es necesario 
        //convertirlo a milisegundos    
        const difTime = new Date().getTimezoneOffset() * 60000;
        //se obtiene la fecha en hexa par alo cual se resta la diferencia 
        //horaria y se convierte a string con base 16
        const keyDate = (Date.now() - difTime).toString(16);

        // el formtato al final que obtengo es:
        //  n-xxxxxxxxxxxxxxxx
        //donde  n   es el numero   _orderkey  y las  x   son el hexa  generado por el uuid
        let key = v4();
        key = key.replace(/-/g, ""); //quitar guiones
        key = key.slice(16); //quitar los 16 primeros bytes para que no sea tan largo el path de busqueda
        key = `${keyDate}-${key}`;
    return key;

}

}
