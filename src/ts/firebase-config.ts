//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
//todo lo de firbase inicial
//aplicacion principal para firebase
import * as firebase from "firebase/app";
//cargar aqui las demas herramientas de la suite de firebase
import "firebase/auth";
import "firebase/firestore";

import { fbKeyConfig_dev, fbKeyConfig_prod } from "./_firebase-key-config";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
//definicion de los contenedores de configuracion 
//ya sea para _dev o para _prod
interface IfbConfig{
    keyConfig:any
}

var fbConfig_dev:IfbConfig = {
    keyConfig : fbKeyConfig_dev,
}

var fbConfig_prod:IfbConfig = {
    keyConfig : fbKeyConfig_prod,
}

//definir en la condicion cuando es _dev y cuando es _prod
var fbConfig = (true) ? fbConfig_dev : fbConfig_prod;

// Initialize Firebase
var fb_app = firebase.initializeApp(fbConfig.keyConfig);

// Initialize cloud functions
var fb_cloudFn = firebase.functions();
//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*class */
//
export class  Fb_app{

    /*getApp()*/
    //devuelve la firebase app activa
    public static getApp(){
        return fb_app;;
    }
    
    /*getFirestore()*/
    //devuelve la instancia de firestore
    public static firestore():firebase.firestore.Firestore{
        return fb_app.firestore();
    }

    /*firestoreReady()*/
    //devuelve la promesa de cuando estará listo firestore
    public static firestoreReady():Promise<void>{
        return fb_app.firestore().enablePersistence();
    }

    /*fb_auth()*/
    //devuelve el objeto configurado para la api de autenticacion
    public static fb_auth(){
        return fb_app.auth();
    }
    
    /*cloudFunctions()*/
    //devuelve el objeto configurado para usar cloud functions
    public static cloudFn(){
        return fb_cloudFn;
    }

    /*fnHttpsCallable()*/
    //reescritura del metodo httpsCallable() de firebase para 
    //poder minimizar los llamados a metodos un una misma linea de codigo
    public static fnHttpsCallable(name:string, options?:firebase.functions.HttpsCallableOptions){
        return fb_cloudFn.httpsCallable(name, options);
    }
    

    
    

}


