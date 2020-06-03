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
import { Router } from "./ts/router"; 

//import Router from "vue-router";
// import VueRouter from 'vue-router'

// Vue.use(VueRouter);

// export const RootRouter = new VueRouter({
//     //mode : "history",
//     // base : process.env.BASE_URL,
//     routes:[
//         {
//             path:"/",
//             // name:"cabeza",
//             component : ()=> <any>import('./components/header/header').then(ts_Comp=>ts_Comp.h),
//             // components : {
//             //     "cabeza" : ()=> <any>import('./components/header/header').then(ts_Comp=>ts_Comp.h),
//             // }
//         }
//     ]
// });

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

