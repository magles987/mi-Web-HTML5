import * as firebase from "firebase/app";
import { FirebaseConfig } from "../../ts/firebase-config/firebase-config";
import axios from "axios";

import { UtilControllers } from "./_Util-ctrl";
import { ModelMetadata } from "./meta";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*class Fb_Controller*/
//
export abstract class Fb_Controller<TModel,TIModel, TModelMeta> {

    //representala suite de apis de firebase
    protected FB:FirebaseConfig;

    //contiene metadata del modelo leido desde cloud function
    public modelMeta:TModelMeta;
    //contiene metadata del modelo leido en *frio* u offline
    //util cuando no hay conexion o cuando se quiere obtener metadata 
    //que no varia sin importar si es de cloud function o de 
    //la instancia offline
    protected modelMeta_Offline:TModelMeta;

    //utilidades para el manejo de consultas y docs
    protected UtilCtrl:UtilControllers;

    //Flag que determina cuando esta listo el servicio para
    //realizar operaciones CRUD
    protected isServiceReady:Boolean;    

    constructor() {
        this.UtilCtrl = new UtilControllers();
        this.FB = FirebaseConfig.getInstance();
    }

    /*updateMetada()*/
    //actualiza la metadata directamente desde cloud functions
    //esa actualizacion la denominaré en *caliente*, si por alguna razon no se puede actualizar en *caliente* se intentara crear un objeto en desde la clase meta correspondiente 
    protected updateMetada():Promise<void>{
        
        //representa la api de cloud functions
        const app_Fn = this.FB.app_Fn; 

        

        //extraer part de modelo meta en *frio*
        const mMeta = <ModelMetadata><unknown>this.modelMeta_Offline;
        let ax = axios.create({
            baseURL:"http://localhost:5001/prueba1-87d2f/",
            
        });
        // let fn = axios.get("http://localhost:5001/prueba1-87d2f/us-central1/helloWorld", {
        //     responseType : "text",
        //     // headers: {
        //     //     "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS, POST",
        //     //     "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
        //     //     "Access-Control-Allow-Origin": "*",
        //     //     "Access-Control-Max-Age": "3600"
        //     //   }
        // });
        let fn = ax.get("us-central1/helloWorld", {
            responseType : "text",
            // headers: {
            //     "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS, POST",
            //     "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
            //     "Access-Control-Allow-Origin": "*",
            //     "Access-Control-Max-Age": "3600"
            //   }
        });        
        //Promise.resolve("mal") 
                    //app_Fn.httpsCallable("helloWorldApp")//(mMeta.__nameFnCloudMeta);

        return fn.then((resultMeta) => {
            
            if (resultMeta && resultMeta != null) {
                console.log(resultMeta);
                //this.modelMeta = <TModelMeta><unknown>resultMeta;    
            }          
            return;
        })
        .catch((error)=>{
            //mensionar el error
            //--Faltatratamiento-- 
            console.log(error);
        })
        .finally(()=>{
            //sin importar si fue un satisfactoria la descarga de la 
            //metadata o un error se verifica que la propiedad 
            //this.modelMeta tenaga asignado un valor
            if (!this.modelMeta || this.modelMeta == null) {
                this.modelMeta = this.modelMeta_Offline;
            }
        })
    }

    /*getDocs()*/
    //
    //Argumentos:
    //cursorQuery: Cursor
    protected getDocs(cursorQuery:firebase.firestore.Query<firebase.firestore.DocumentData>){
        return this.FB.firestoreReady()
        //ejecutar la lectura
        .then(()=>{
            return cursorQuery.get()
            .then((docsData) => {
                let docs:TModel[] = [];
                docsData.forEach((docD) => {                
                    const d = docD.data() as TModel;
                    docs.push(d);
                });
                return docs;
            });
        })
        

    }

    /*getBy_id()*/
    //
    //Parametros:
    //
    protected getBy_id(cursorRef_id:firebase.firestore.DocumentReference<firebase.firestore.DocumentData>){
        return this.FB.firestoreReady()
        //ejecutar la lectura
        .then(() => {
            return  cursorRef_id.get()
            .then((docData) => {
                let doc = docData.data() as TModel;
                return doc;
            });
        });
    }


    /*create()*/
    //
    //newDoc: el nuevo documento a almacenar
    //
    //_pathBase: si el modelo hace parte de una subcoleccion se 
    //debe recibir un path base para construir la consulta de 
    //creacion del documento
    protected create(newDoc:TModel, _pathBase=""){

        //extraer part de modelo meta
        const mMeta = <ModelMetadata><unknown>this.modelMeta;

        //asignar campos especiales
        newDoc["_id"] = this.UtilCtrl.createIds();
        newDoc["_pathDoc"] = (_pathBase === "") ?
                            `${mMeta.__nomColeccion}/${newDoc["_id"]}` :
                            `${_pathBase}/${mMeta.__nomColeccion}/${newDoc["_id"]}`
    
        const collectionPath = this.UtilCtrl.getPathCollection(mMeta, _pathBase);

        return this.FB.firestoreReady()
        //actualizar la metadata
        .then(() => this.updateMetada())
        //ejecutar creacion
        .then(() => {
            return this.FB.app_FS
            .collection(collectionPath)
            .doc(newDoc["_id"])
            .set(newDoc, { merge: true });
        })
    }

    /*update()*/
    //
    //updatedDoc: el documento ya modificado listo a guradar
    //
    //_pathBase: si el modelo hace parte de una subcoleccion se 
    //debe recibir un path base para construir la consulta de 
    //modificacion del documento
    protected update(updatedDoc:TModel, _pathBase=""){
        
        //extraer part de modelo meta
        const mMeta = <ModelMetadata><unknown>this.modelMeta;

        const collectionPath = this.UtilCtrl.getPathCollection(mMeta, _pathBase);

        return this.FB.firestoreReady()
        //actualizar la metadata
        .then(() => this.updateMetada())
        //ejecutar la actualizacion
        .then(() => {
            return this.FB.app_FS
            .collection(collectionPath)
            .doc(updatedDoc["_id"])
            .update(updatedDoc);
        })
    }

    /*delete()*/
    //
    //Parametros:
    //
    //id: el _id del docuemnto a eliminar
    //
    //_pathBase: si el modelo hace parte de una subcoleccion se 
    //debe recibir un path base para construir la consulta de 
    //modificacion del documento
    public delete(_id:string, _pathBase=""){

        //extraer part de modelo meta
        const mMeta = <ModelMetadata><unknown>this.modelMeta;

        const collectionPath = this.UtilCtrl.getPathCollection(mMeta, _pathBase);

        return this.FB.firestoreReady()
            //actualizar la metadata
            .then(() => this.updateMetada())
            //ejecutar la actualizacion
            .then(() => {
                return this.FB.app_FS
                    .collection(collectionPath)
                    .doc(_id)
                    .delete();
            })
    }

}
