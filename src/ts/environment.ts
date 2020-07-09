import { fbKey_dev, fbKey_prod } from "./firebase-config/_firebase-key-config";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*SELECTORES de entorno*/
//se deben declarar el o los selectores de entorno (con su correspondiente tipado)
//y luego asignarlos
var ENV_SELECTOR:"dev" | "prod"; //especificar las posibles opciones
    ENV_SELECTOR="dev"; //seleccionar

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*interfaz IENV que ya completa*/
interface IENV {
    firebase:{
        //contiene la key del proyecto de la suite de firebase
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
/*Desarrollo estandar*/
var ENV_dev:IENV = {
    firebase : {
        fbKey : fbKey_dev,

        isLocalCloudFunctions : true,
        isLocalFirebase : false,
        isLocalFirestore :false,
        isLocalStorage : false,
    }
}
/*Produccion estandar*/
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
/*Objetos ENV a retornar segun configuracion*/
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