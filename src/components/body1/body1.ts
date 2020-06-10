import Vue from 'vue'
import "./body1.scss";

import { Fb_Auth } from '../../MC-firebase/auth/auth';

export var VComponent = Vue.extend({
    template:require("./body1.html"),
    data : function() {
        return new dataClase()
    }
})

class dataClase {
    campo1:string;
    campo2:string;

    constructor() {
        this.campo1 = "Body1";

        
        setTimeout(() => {
            let auth = new Fb_Auth();
            auth.signIn("local", "PopUp", "andres@andres.com", "987000")
            .then((user) => {
                this.campo1 = user.displayName;
            })            
        }, 10000);
    }

    /*clickeando()*/
    //
    //Parametros:
    //
    public clickeando():void{
        console.log("clickeando");
    }    
}