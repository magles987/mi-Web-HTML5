//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
//todo lo de firbase inicial
//aplicacion principal para firebase
import * as firebase from "firebase/app";
//cargar aqui las demas herramientas de la suite de firebase
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";

import { ENV } from "../environment";
import { fbKey_dev, fbKey_prod } from "./_firebase-key-config";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
//host de los servicios de la suite de firebase (incluyendo emuladores)
export var host = {

    //path Project
    //obtiene el proyecto directamente de la 
    //configuracion secreta o lo establece como  ""
    pathProject: `/${ENV().firebase.fbKey['projectId'] || ''}`,

    //Ubicacion
    locationProyect:"/us-central1",

    //remotos (de la suite de firebase)
    CloudFunctions : "",
    Firebase:"",
    Firestore:"",
    Storage:"",
    
    //emuladores:
    Emu_CloudFunctions : "http://localhost:5001",
    Emu_Firebase:"",
    Emu_Firestore:"",
    Emu_Storage:"",
};

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*class FirebaseConfig*/
//configuracion inicial y UNICA de las apis del set de firebase que se 
//usaran desde cloud Funtions tambien llamado ServerFN 
//(Ejemplo: firestore, auth, las mismas cloudfunctions y demas)
//IMPORTANTE:
//clase configurada para singleton basico, NO se debe crear por medio de new
//sino usar el metodo static getInstance()
export class  FirebaseConfig{

    //host de firebase segun apis (y segun si son emulados)
    public host = host;

    //app representacion de la siute de firebase
    private app:firebase.app.App;
    
    //propiedad que contiene la representacion del api 
    //de Firestore ya configurada
    public app_FS:firebase.firestore.Firestore;

    //propiedad que contiene la representacion del api 
    //de Auth ya configurada
    public app_Auth:firebase.auth.Auth;

    //propiedad que contiene la representacion del api 
    //de cloud Functions ya configurada
    public app_Fn:firebase.functions.Functions;    

    //propiedad UNICA para el singleton
    private static instance:FirebaseConfig;
    
    //Importante:
    //para un singleton en typescript NO se recomeinada
    //declarar PROPIEDADES DE CLASE dentro del constructor 
    //(argumentos de constructor si se pueden recibir) 
    //que son enviados desde el metodo estatico getInstance()
    constructor() {
        //garantizar que NO se crearan configuraciones 
        //adicionales si ya existe una instancia
        if (!FirebaseConfig.instance) {

            const fbConfig = ENV().firebase;

            //configuracion de app que representa la suite de firebase
            this.app = firebase.initializeApp(fbConfig.fbKey);

            //configuracion de apis especificas de firebase:            
            this.app_FS = this.app.firestore();
            this.app_Auth = this.app.auth();
            this.app_Fn = firebase.functions();

            //detectar si se esta usando el emulador de cloud functions
            if (fbConfig.isLocalCloudFunctions) {
                this.app_Fn.useFunctionsEmulator(this.host.Emu_CloudFunctions);                
            }

            //configurar los proveedores de autenticacion 
            //(google, facebook, twitter) para que muestren
            // una Interfaz en español
            this.app_Auth.languageCode = 'es';

        }            
    }

    /*getInstance()*/
    //obtener una instancia UNICA (singleton)
    public static getInstance():FirebaseConfig{
        if (!FirebaseConfig.instance) {
            FirebaseConfig.instance = new FirebaseConfig();
        }
        return FirebaseConfig.instance;
    }

    /*firestoreReady()*/
    //devuelve la promesa de cuando estará listo firestore
    public firestoreReady():Promise<void>{
        // return this.app_FS.enablePersistence();
        return Promise.resolve();
    }
    

    /*callFnWithOnCall()*/
    // un llamado exclusivo que tiene la suite de firebase para llamar 
    //CloudFunctions como si se estuviera usando el patron de diseño 
    //proxy para funciones, la funcion declarada en cloud function 
    //debe ser de tipo   onCall   , y solo debe ser usada para esperar 
    //un JSON (no sive para otro tipo de respuestas), la ventaja que 
    //tiene es que no hay que configurar cors y es mas rapida, solo 
    //se necesita el nombre de la cloudFunction a llamar y NO se 
    //necesita de clientes HTTP como axios
    //es ideal para obtener la metadata
    //
    //Argumentos:
    //nomFn: el nombre de la funcion IMPORTANTE: NO es el path, es el nombre
    //
    //ReqData: datos de request (configuracion de la peticion , 
    //que se hará con algun tipo o interfaz de objeto personalizada)
    //
    //options: opcionales, parece que solo sirve para determinar 
    //cuanto tiempo se debe esperar la respuesta
    public callFnWithOnCall<TReqData>(nomFn:string, ReqData:TReqData, options?:firebase.functions.HttpsCallableOptions){
        const preCall = this.app_Fn.httpsCallable(nomFn, options);
        return preCall(ReqData);
    }

    

}


