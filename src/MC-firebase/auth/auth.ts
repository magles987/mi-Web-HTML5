import * as firebase from "firebase/app";
import { Fb_app } from "../../ts/firebase-config";

//cargar la api de auth de Firebase
import "firebase/auth";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*class Auth*/
//
export class Auth {

    private UserCredential:firebase.auth.UserCredential;
    public static currentUser:firebase.User;

    private mapAuthProviders:Map<string, any>;

    constructor() {       
        //configurar los proveedores de autenticacion 
        //(google, facebook, twitter) para que muestren
        // una Interfaz en español
        firebase.auth().languageCode = 'es';

        this.AuthStateChanged();
        this.mapAuthProviders = new Map();
    }

    /*AuthStateChanged()*/
    //detecta automaticamente si el usuario a cambiado
    private AuthStateChanged():void{
        firebase.auth().onAuthStateChanged((cUser) => {
            Auth.currentUser = (cUser)? cUser : null;
            return;
        })
        return;
    }

    /*createAuthByEmail()*/
    //
    //Parametros:
    //
    public createAuthWithEmail(email:string, password:string){     
        return firebase.auth().createUserWithEmailAndPassword(email, password)
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
        nomProvider:"local" | "google" | "facebook",
        type: "PopUp" | "Redirect"
    ){
        switch (nomProvider) {
            case "local":

                break;

            case "google":
                const provider = this.mapAuthProviders.get(nomProvider);
                
                if (type == "PopUp") {
                    return firebase.auth().signInWithPopup(provider)
                    .then((credentials) => {
                        this.UserCredential = credentials;
                        return credentials.user;
                    })
                }
                
                if (type == "Redirect") {
                    firebase.auth().signInWithRedirect(provider);
                    return  firebase.auth().getRedirectResult()
                    .then((credentials) => {
                        this.UserCredential = credentials;
                        return credentials.user;
                    })
                }

                break;                

            case "facebook":

                break;                    
        
            default:
                break;
        }
    }

    /*createAuthByEmail()*/
    // configura el uso de autenticacion por Google
    private  configAuthWithGoogle(){
        const nomProvider = "google";
        const provider = new firebase.auth.GoogleAuthProvider();
        //indica los campos que se desean leer del usuario (opcional)
        provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
        //asigna propiedades personalizadas que se reciben del usuario autenticado
        provider.setCustomParameters({
            //..Lo que se necesite..
        });
        this.mapAuthProviders.set(nomProvider, provider);

    }



}
