// import { Environment } from "./ts/environment";

//importaciones de vuejs
import Vue from 'vue'
import { Router } from "./ts/router"; 
//import App from './App'

//configuracion y puesta en marcha de firebase
import { Fb_app } from "./ts/firebase-config";

//

//importaciones de estilos globales:
//import "../css/global.css"

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
//Funcion main de entrada

function main() {

    new Vue({
    
        el: '#app',
        router : Router,
        components: { 
            //los componentes que su tag sea igual al de un tag oficial de html 
            //es necesario colocarles un sufijo -c y lo mismo en la plantilla
            "header-c" : ()=> <any>import('./components/header/header').then(ts_Comp=>ts_Comp.HeaderComponent.getVueComponent()),
            "login-form" : ()=> <any>import('./components/login-form/login-form').then(ts_Comp=>ts_Comp.LoginFormComponent.getVueComponent()),
            "footer-c" : ()=> <any>import('./components/footer/footer').then(ts_Comp=>ts_Comp.FooterComponent.getVueComponent()),
        }
      })

}
main();

