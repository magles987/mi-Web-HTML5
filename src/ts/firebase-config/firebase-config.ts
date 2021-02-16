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
/** 
 * configuraciones de hosts dependiendo el  entorno de ejecucion,
 * aqui se definen partes de la url Base, host para produccion y emuladores
*/
export var host = {

    /**Id del proyecto que se usa como path Project
     * obtiene el proyecto directamente de la 
     * configuracion secreta o lo establece como `""`
     */
    PROJECT_ID: `/${ENV().firebase.fbKey['projectId'] || ''}`,

    /**Ubicacion del proyecto segun los servidores de Google */
    GCP_REGION:"/us-central1",

    /**Habilita la persistencia offline en aplicaciones web */
    isEnablePersistenceInWeb : true,

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
/** @info <hr>  
 * *class singleton*  
 * Configuracion inicial y UNICA de las apis del set de firebase que se  
 * usaran desde cloud Funtions tambien llamado ServerFN
 * (Ejemplo: firestore, auth, las mismas cloudfunctions y demas).  
 * ____
 */
export class  FirebaseConfig{

    /**contien los diferentes hosts a utilizar */
    public host = host;

    /**representacion de la api completa de la siute de firebase*/
    private app:firebase.app.App;
    
    /** propiedad que contiene la representacion del api 
     * de Firestore ya configurada
     */
    public app_FS:firebase.firestore.Firestore;

    /** propiedad que contiene la representacion del api 
     * de Auth ya configurada
     */
    public app_Auth:firebase.auth.Auth;

    /** propiedad que contiene la representacion del api 
     * de cloud Functions ya configurada 
     */
    public app_Fn:firebase.functions.Functions;    

    /**almacen a la instancia *unica* de esta clase*/
    private static instance:FirebaseConfig;
    
    /** 
     * `constructor()`  
     * se recomienda en singleton no decrarar 
     * propiedades de clase en el constructor
     * ____
     */
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

            //determinar si se desea persistencia offLine en web
            if (host.isEnablePersistenceInWeb) {
                this.app_FS.enablePersistence();
                //como devuelve una promesa se puede cachear errores
            }

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

    /** 
     * *static*    
     * permite obtener la unica instancia de esta clase
     * , si no existe la crea solo una vez
     * ____
     */
    public static getInstance():FirebaseConfig{
        if (!FirebaseConfig.instance) {
            FirebaseConfig.instance = new FirebaseConfig();
        }
        return FirebaseConfig.instance;
    }

    /** 
     * `callFnWithOnCall()`  
     * permite un llamado exclusivo que tiene la suite de 
     * firebase para ejecutarCloudFunctions como si se 
     * estuviera usando el patron de diseño proxy para 
     * funciones. 
     * La funcion declarada en cloudfunction debe ser de
     *  tipo *onCall*, y solo debe ser usada para esperar 
     * un JSON (no sive para otro tipo de respuestas), 
     * la ventaja que tiene es que no hay que configurar 
     * cors del lado de firebase ni clientes http (como 
     * axiox para VUEjs) y es mas rapida, solo se necesita 
     * el nombre de la cloudFunction a llamar.  
     * Es ideal para obtener la metadata
     * 
     * *Param:*  
     * `nomFn` : el nombre de la funcion recordar que **NO** 
     * es el path, es el nombre con el que se declaró.  
     * `ReqData` : datos de request (configuracion de la 
     * peticion , que se hará con algun tipo o interfaz de 
     * objeto personalizada).  
     * `options` : opcionales, parece que solo sirve para 
     * determinar cuanto tiempo se debe esperar la respuesta
     * ____
     * *Types:*    
     * `TReqData` : representa la estructura de la data a 
     * enviar con la peticion
     * ____
     */
    public callFnWithOnCall<TReqData>(nomFn:string, ReqData:TReqData, options?:firebase.functions.HttpsCallableOptions){
        const preCall = this.app_Fn.httpsCallable(nomFn, options);
        return preCall(ReqData);
    }
}


