//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
//todo lo de firbase inicial
//aplicacion principal para firebase
import * as firebase from "firebase/app";
//cargar aqui las demas herramientas de la suite de firebase
import "firebase/auth";
import "firebase/firestore";

import { fbKeyConfig_dev, fbKeyConfig_prod } from "./_firebase-key-config";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
//definicion de los contenedores de configuracion 
//ya sea para _dev o para _prod
interface IfbConfig{
    keyConfig:any
}

var fbConfig_dev:IfbConfig = {
    keyConfig : fbKeyConfig_dev,
}

var fbConfig_prod:IfbConfig = {
    keyConfig : fbKeyConfig_prod,
}

//definir en la condicion cuando es _dev y cuando es _prod
var fbConfig = (true) ? fbConfig_dev : fbConfig_prod;

// Initialize Firebase
export var fb_app = firebase.initializeApp(fbConfig.keyConfig);
//================================================================================================================================