import Vue from 'vue'
import "./body1.scss";

import { Fb_Auth } from '../../MC-firebase/auth/auth';

export var VComponent = Vue.extend({
    template:require("./body1.html"),
    data : function() {
        return new Class_component()
    }
})

class Class_component {
    campo1:string;
    campo2:string;

    constructor() {
        this.campo1 = "Body1";
        // let auth = Fb_Auth.getAuth();
        
        // setTimeout(() => {
            
        //     if (auth.currentUser && auth.currentUser != null) {
        //         this.campo1 = auth.currentUser.email;
        //         auth.signOut()
        //         .then(() => {
        //             this.campo1 = (auth.currentUser)? auth.currentUser.email : "";
        //         });
        //     } else {
        //         auth.signIn("local", "PopUp", "andres@andres.com", "987CCC")
        //         .then((user) => {
        //             this.campo1 = user.email;
        //         })                     
        //     }

       
        // }, 10000);
    }

    /*clickeando()*/
    //
    //Parametros:
    //
    public clickeando():void{
        console.log("clickeando");
    }    
}