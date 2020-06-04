// import { Environment } from "./ts/environment";

//importaciones de vuejs
import Vue from 'vue'
import { Router } from "./ts/router"; 
//import App from './App'

//configuracion y puesta en marcha de firebase
import { fb_app } from "./ts/firebase-config";

//

//importaciones de estilos globales:
//import "../css/global.css"

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
//Funcion main de entrada

function main() {

    new Vue({
    
        // el: '#app',
        router : Router,
        components: { 
            "cabeza" : ()=> <any>import('./components/header/header').then(ts_Comp=>ts_Comp.VComponent),
            "pie" : ()=> <any>import('./components/footer/footer').then(ts_Comp=>ts_Comp.VComponent),
        }
      }).$mount("#app"); //con $mount puedo evitar tener que determinar dentro de la construsccion inicial a que elemento quiero cargar este trozo de vuejs

}
main();

