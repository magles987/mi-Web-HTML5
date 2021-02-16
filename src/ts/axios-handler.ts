import axios, { AxiosInstance } from "axios";
import { host } from "./firebase-config/firebase-config";
import { ENV } from "./environment";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class* 
 * handler dedicado a la configuracion y administracion 
 * de la libreria Axios (cliente para peticiones http 
 * desde Vue)
 * ____
 */
export class AxiosHandler {

    /** 
     * *static* 
     * almacen la unica instancia que se crea 
     * de esta clase
     * ____
     */
    private static instance:AxiosHandler;

    /** 
     * `constructor()`
     * ____
     */
    constructor() {}

    /** 
     * *static* `getInstance()`  
     * permite obtener la unica instancia de esta clase
     * , si no existe la crea solo una vez
     * ____
     */
    public static getInstance():AxiosHandler{
        if (!AxiosHandler.instance) {
            AxiosHandler.instance = new AxiosHandler();
        }
        return AxiosHandler.instance;
    }

    /*getAxios()*/
    //
    //Argumentos:
    //selectType: selecciona el tipo de instancia axios que se desea usar

    /** 
     * *public*
     * permite configurar y devuelve una nueva instancia 
     * de axios de acuerdo al tipo de servidor y entorno 
     * al cual se le requiera hacer las peticiones
     * 
     * *Param:*  
     * `selectType` : seleccion del tipo de configuracion 
     * deseada
     * ____
     */
    public getAxiosInstance(selectType:"FnCloud" | "otherHost"):AxiosInstance{
        
        switch (selectType) {
            case "FnCloud":
                    //construir y determinar el baseURL a usar de acuerdo al entorno
                    const hfn = `https://${host.GCP_REGION}-${host.PROJECT_ID}.cloudfunctions.net/`;
                    const E_hfn = `${host.Emu_CloudFunctions}/${host.PROJECT_ID}/${host.GCP_REGION}/`;
                    const baseURL = (ENV().firebase.isLocalCloudFunctions) ? E_hfn : hfn ;
                    
                    return axios.create({
                        baseURL,                       
                    });        
                break;
        
            default:
                break;
        }
        return;
    }
    
    /** 
     * *public*  
     * permite construir una peticion GET con parametros 
     * de objeto JSON sencillos (de solo un nivel de 
     * profundidad)
     * 
     * **Importante:**  
     * el objeto JSON no puede tener campos de tipo 
     * objeto (subobjetos)  
     * --FALTA CONSTRUIR--
     * 
     * *Param:*  
     * `baseURL` base de URL para construir la peticion.  
     * `ReqData` : datos de request (configuracion de la 
     * peticion , que se hará con algun tipo o interfaz de 
     * objeto personalizada).  
     * ____
     * *Types:*    
     * `TReqData` : representa la estructura de la data a 
     * enviar con la peticion
     * ____
     */
    public buildReqForGetMethod<TReqData>(baseURL:string, ReqData:TReqData):string{
        let strReqGet = `${baseURL}?`;
        let ArrBuffData:string[] = [];

        for (const nd in ReqData) {
            if (ReqData.hasOwnProperty(nd) && typeof(ReqData[nd]) != "function" ) {
                //formatear los datos para recibirlos como peticion HTTP GET
                const formatData = `${encodeURIComponent(nd)}=${encodeURIComponent(<any>ReqData[nd])}`;
                ArrBuffData.push(formatData);
            }
        }
        strReqGet = `${strReqGet}${ArrBuffData.join("&")}`;
        return strReqGet;
    }
 
    

}
