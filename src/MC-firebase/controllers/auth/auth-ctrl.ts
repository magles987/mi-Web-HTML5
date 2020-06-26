import * as firebase from "firebase/app";
import { Fb_app } from "../../../ts/firebase-config";

//cargar la api de auth de Firebase
import "firebase/auth";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*class Auth*/
//
export class Fb_AuthController {

    //instancia de la app usada
    private auth:firebase.auth.Auth;

    //contenedor instancia Singleton
    private  static AuthCtrl:Fb_AuthController;

    private UserCredential:firebase.auth.UserCredential;
    public currentUser:firebase.User;

    private mapAuthProviders:Map<string, any>;

    constructor() {  
        //inicializar mapas     
        this.mapAuthProviders = new Map();
        
        //obtener la instancia de la app de firebase
        //que se esta usando
        this.auth = Fb_app.fb_auth();

        //configurar los proveedores de autenticacion 
        //(google, facebook, twitter) para que muestren
        // una Interfaz en español
        this.auth.languageCode = 'es';

        this.configAuthWithGoogle();
        this.configAuthWithFacebook();
        this.configAuthWithTwitter();

        this.AuthStateChanged();
        
    }

    /*getAuth()*/
    //obtener una unica instancia (Singleton)
    public static getAuth():Fb_AuthController{
        const instance = (Fb_AuthController.AuthCtrl)? Fb_AuthController.AuthCtrl : new Fb_AuthController();
        Fb_AuthController.AuthCtrl = instance;
        return instance;
    }
    
    /*AuthStateChanged()*/
    //detecta automaticamente si el usuario a cambiado
    private AuthStateChanged():void{
        this.auth.onAuthStateChanged((cUser) => {
            this.currentUser = (cUser)? cUser : null;
            return;
        })
        return;
    }

    /*createAuthByEmail()*/
    //
    //Parametros:
    //
    public createAuthWithEmail(email:string, password:string){     
        return this.auth.createUserWithEmailAndPassword(email, password)
            .then((credentials) => {
                this.UserCredential = credentials;
                return credentials.user;
            })   
    }


    /*signIn()*/
    //Loguearse
    //Parametros:
    //
    public signIn(
        nomProvider:"local" | "google" | "facebook" | "twitter",
        type: "PopUp" | "Redirect",
        email?:string, 
        password?:string
    ){
        
        const provider = this.mapAuthProviders.get(nomProvider);
        
        // si es local tiene un tratamiento especial
        if (nomProvider == "local") {
            return this.auth.signInWithEmailAndPassword(email, password)
            .then((credentials) => {
                this.UserCredential = credentials;
                this.currentUser = credentials.user;
                return credentials.user;
            });
        }

        //logueo a traves de proveedores externos

        //tipo de despliegue de formulario
        if (type == "PopUp") {
            return this.auth.signInWithPopup(provider)
            .then((credentials) => {
                this.UserCredential = credentials;
                this.currentUser = credentials.user;
                return credentials.user;
            })
        }
        
        if (type == "Redirect") {
            return  this.auth.signInWithRedirect(provider)
            .then(() => {
                return this.auth.getRedirectResult();
            })            
            .then((credentials) => {
                this.UserCredential = credentials;
                this.currentUser = credentials.user;
                return credentials.user;
            })
        }

    }

    /*signOut()*/
    //desloguearse de cualquier proovedor
    public signOut(){
        return this.auth.signOut()
        .then(() => {
            this.currentUser = null;
            this.UserCredential = null;
            return;
        })
    }

    /*createAuthByEmail()*/
    // configura el uso de autenticacion por Google
    private  configAuthWithGoogle(){
        const nomProvider = "google";
        const provider = new firebase.auth.GoogleAuthProvider();
        //indica los campos que se desean leer del usuario (opcional)
        // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
        //asigna propiedades personalizadas que se reciben del usuario autenticado
        provider.setCustomParameters({
            //..Lo que se necesite..
        });
        this.mapAuthProviders.set(nomProvider, provider);
    }

    /*configAuthWithFacebook()*/
    // configura el uso de autenticacion por Facebook
    private  configAuthWithFacebook(){
        const nomProvider = "facebook";
        const provider = new firebase.auth.FacebookAuthProvider();
        //indica los campos que se desean leer del usuario (opcional)
        //provider.addScope('https://.....');
        //asigna propiedades personalizadas que se reciben del usuario autenticado
        provider.setCustomParameters({
            //..Lo que se necesite..
        });
        this.mapAuthProviders.set(nomProvider, provider);
    }

        /*configAuthWithFacebook()*/
    // configura el uso de autenticacion por Facebook
    private  configAuthWithTwitter(){
        const nomProvider = "twitter";
        const provider = new firebase.auth.TwitterAuthProvider();
        //indica los campos que se desean leer del usuario (opcional)
        //provider.addScope('https://.....');
        //asigna propiedades personalizadas que se reciben del usuario autenticado
        provider.setCustomParameters({
            //..Lo que se necesite..
        });
        this.mapAuthProviders.set(nomProvider, provider);
    }



}
