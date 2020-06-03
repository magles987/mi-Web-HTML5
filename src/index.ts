// import { Environment } from "./ts/environment";
// //████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
// //todo lo de firbase inicial
// //aplicacion principal para firebase
// import * as firebase from "firebase/app";
// //cargar aqui las demas herramientas de la suite de firebase
// import "firebase/auth";
// import "firebase/firestore";

// // Initialize Firebase
// firebase.initializeApp(new Environment().firebaseConfig.init_config);
//================================================================================================================================

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
//importaciones de estilos globales:
//import "../css/global.css"

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
//Funcion main de entrada

import Vue from 'vue'
//import App from './App'

import { h } from "./components/header/header";

function main() {

    new Vue({
    
        el: '#app',
        components: { 
            "cabeza" : h,
        }
      })
}
main();

