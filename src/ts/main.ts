//aplicacion principal para firebase
import * as firebase from "firebase/app";
//cargar aqui las demas herramientas de la suite de firebase
import "firebase/auth";
import "firebase/firestore";

import { alfa } from "./hola2";

// constante global de la configuracion de firebase
//son datos personales pero que pueden ser publicos 
//siempre y cuando se mantengan las reglas de seguridad
const firebaseConfig = {
    // ...
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


//funcion main autoejecutable
function main() {
  let app = new alfa();
}
main();

