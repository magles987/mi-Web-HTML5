import Vue from 'vue'
import "./login-form.scss";

import { Fb_Auth } from '../../MC-firebase/auth/auth';

import jquery from "jquery";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
class Class_component {

    public currentUser:firebase.User;
    public login_email:string;
    public login_password:string;

    private auth:Fb_Auth;

    private JQ_Component:JQuery<HTMLElement>;

    constructor() {

        this.auth = Fb_Auth.getAuth();
        this.currentUser = this.auth.currentUser; 
        this.login_email = "";
        this.login_password = "";

        let JQ_Component = jquery("");

    }

    /*loguearse()*/
    //
    public loguearse():void{
        this.auth.signIn("local", "PopUp", "andres@andres.com", "987000")
        .then((user) => {
            this.currentUser = user;
        })
        .catch((error)=>{ console.log(error)})  
    }

    /*desloguearse()*/
    //
    //Parametros:
    //
    public desloguearse():void{
        this.auth.signOut()
        .then(() => {
            this.currentUser = null;
        })
        .catch((error)=>{ console.log(error)})  
    }
}
//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████


//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
export var VComponent = Vue.extend({
    template:require("./login-form.html"),
    data : function() {
        return new Class_component()
    },
    //hook cuando se haya creado el componente en memoria
    created : function () {        
    },
    //hook cuando ya se halla montado el html template
    mounted : function () {

    }
})


