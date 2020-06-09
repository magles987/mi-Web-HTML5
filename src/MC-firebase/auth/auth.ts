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

    constructor() {       
        //configurar los proveedores de autenticacion 
        //(google, facebook, twitter) para que muestren
        // una Interfaz en español
        firebase.auth().languageCode = 'es';

        this.AuthStateChanged();
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

    public

}
