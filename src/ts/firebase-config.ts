//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
//todo lo de firbase inicial
//aplicacion principal para firebase
import * as firebase from "firebase/app";
//cargar aqui las demas herramientas de la suite de firebase
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";

import { fbKeyConfig_dev, fbKeyConfig_prod } from "./_firebase-key-config";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
//definicion de los contenedores de configuracion 
//ya sea para _dev o para _prod
interface IfbConfig{
    keyConfig:any
}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*class FirebaseConfig*/
//configuracion inicial y UNICA de las apis del set de firebase que se 
//usaran desde cloud Funtions tambien llamado ServerFN 
//(Ejemplo: firestore, auth, las mismas cloudfunctions y demas)
//IMPORTANTE:
//clase configurada para singleton basico, NO se debe crear por medio de new
//sino usar el metodo static getInstance()
export class  FirebaseConfig{

    //flags de estado
    private _isDevelop = true;
    private _isLocalCloudFunctions = true;

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

            //escoger objeto secretos y constantes 
            //de configuracion
            const fbConfig_dev:IfbConfig = {
                keyConfig : fbKeyConfig_dev,
            }
            const fbConfig_prod:IfbConfig = {
                keyConfig : fbKeyConfig_prod,
            }
            const fbConfig = (this._isDevelop) ? fbConfig_dev : fbConfig_prod;

            //configuracion de app que representa la suite de firebase
            this.app = firebase.initializeApp(fbConfig.keyConfig);

            //configuracion de apis especificas de firebase:            
            this.app_FS = this.app.firestore();
            this.app_Auth = this.app.auth();
            this.app_Fn = firebase.functions();

            //detectar si se esta usando el emulador de cloud functions
            if (this._isLocalCloudFunctions) {
                this.app_Fn.useFunctionsEmulator("http://localhost:5001");                
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
    




    // /*getApp()*/
    // //devuelve la firebase app activa
    // public static getApp(){
    //     return fb_app;;
    // }
    
    // /*getFirestore()*/
    // //devuelve la instancia de firestore
    // public static firestore():firebase.firestore.Firestore{
    //     return fb_app.firestore();
    // }



    // /*fb_auth()*/
    // //devuelve el objeto configurado para la api de autenticacion
    // public static fb_auth(){
    //     return fb_app.auth();
    // }
    
    // /*cloudFunctions()*/
    // //devuelve el objeto configurado para usar cloud functions
    // public static cloudFn(){
    //     return fb_cloudFn;
    // }

    // /*fnHttpsCallable()*/
    // //reescritura del metodo httpsCallable() de firebase para 
    // //poder minimizar los llamados a metodos un una misma linea de codigo
    // public static fnHttpsCallable(name:string, options?:firebase.functions.HttpsCallableOptions){
    //     return fb_cloudFn.httpsCallable(name, options);
    // }

    

}


