import { fbKey_dev, fbKey_prod } from "./firebase-config/_firebase-key-config";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** 
 * Almacena el entono en el que se esta ejecutando la 
 * aplicacion para poder configurar globalmente.  
 * 
*/
//especificar las posibles opciones en forma de tipado
var ENV_SELECTOR:"dev" | "prod"; 
    //seleccionar
    ENV_SELECTOR = "dev"; 

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *interface*
 * se debe implementar para cada objeto de 
 * configuracion de ENVIROMENT
 * ____
 */
interface IENV {
    /**Contiene la configuracion de 
     * Entorno para la suite de firebase 
     */
    firebase:{
        
        /**Contien la key de acceso al proyecto de firebase */
        fbKey : any;

        //banderas para emuladores:
        isLocalFirebase:boolean;
        isLocalFirestore:boolean;
        isLocalCloudFunctions:boolean;
        isLocalStorage:boolean;        
    }
}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*Objetos ENV de acuerdo al entorno*/
/**Configuracion de desarrolo estandar */
var ENV_dev:IENV = {
    firebase : {
        fbKey : fbKey_dev,

        isLocalCloudFunctions : true,
        isLocalFirebase : false,
        isLocalFirestore :false,
        isLocalStorage : false,
    }
}
/**Configuracion de  produccion estandar */
var ENV_prod:IENV = {
    firebase : {
        fbKey : fbKey_prod,

        isLocalCloudFunctions : false,
        isLocalFirebase : false,
        isLocalFirestore :false,
        isLocalStorage : false,
    }
}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** 
 * Contiene la funcion que devuelve la configuracion 
 * de acuerdo al entorno seleccionado
 * 
*/
export var ENV = function ():IENV {

    switch (ENV_SELECTOR) {
        case "dev":
            return ENV_dev
            break;
        case "prod":
            return ENV_prod
            break;            
    
        default:
            return ENV_dev
            break;
    }
}