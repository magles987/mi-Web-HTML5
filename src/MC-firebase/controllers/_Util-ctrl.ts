import { v4 } from "uuid";
import { ModelMetadata } from "./meta";
//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*class UtilesControllers*/
//
export class UtilControllers {

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

    /*getPathCollection()*/
    //obtener el path de la coleccion o subcoleccion,
    //en las colecciones devuelve el mismo nom ya qeu son Raiz
    //Parametros:
    //
    //modelMeta: la metadata del modelo para usar como referencia
    //
    //pathBase ->  path complemento para construir el el path completo
    //             util para las subcolecciones
    public getPathCollection(modelMeta:unknown, pathBase:string=""):string{

        //en caso de recibir null
        if (pathBase == null) {
            pathBase = "";
        }

        //cast obligado:
        const col_Meta = <ModelMetadata>modelMeta;

        return (col_Meta.__isEmbSubcoleccion && pathBase != "") ?
            `${pathBase}/${col_Meta.__nomColeccion}` :
            `${col_Meta.__nomColeccion}`;

    }   

    /*createEmptyModel<TModel>()*/
    //
    //Parametros:
    //modelMeta: instancia de los metadatos del modelo 
    //(se recibe como any para que sea generica)
    public createEmptyModel<TModel>(modelMeta:any):TModel{
        let Model = <TModel>{};
        for (const c_m in modelMeta) {
            //garantizar que sean campos del modelo
            //y que tengan una propiedad default
            if(modelMeta[c_m].hasOwnProperty("nom") &&
               modelMeta[c_m].hasOwnProperty("default")
            ){
                Model[<string>c_m] = modelMeta[c_m]["default"];
            }
        }
        return Model;
    }

}
