import * as firebase from "firebase/app";
import { Fb_app } from "../../ts/firebase-config";

import { UtilesControllers } from "./_Utiles";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*class Fb_Controller*/
//
export abstract class Fb_Controller<TModel> {

    protected UtilCtrl:UtilesControllers;

    constructor() {
        this.UtilCtrl = new UtilesControllers();
    }

    /*getDocs()*/
    //
    //Argumentos:
    //cursorQuery: Cursor
    protected getDocs(cursorQuery:firebase.firestore.Query<firebase.firestore.DocumentData>){
        return Fb_app.firestoreReady()
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
        return Fb_app.firestoreReady()
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
    //Parametros:
    //
    protected create(newDoc:TModel, nomCollection:string, _pathBase=""){
        
        newDoc["_id"] = this.UtilCtrl.createIds();
        newDoc["_pathDoc"] = (_pathBase === "") ?
                            `${nomCollection}/${newDoc["_pathDoc"]}` :
                            `${_pathBase}/${nomCollection}/${newDoc["_pathDoc"]}`
    
        let collectionPath = (_pathBase === "") ?
                            `${nomCollection}` :
                            `${_pathBase}/${nomCollection}`

        return Fb_app.firestoreReady()
        .then(() => {
            return Fb_app.firestore()
            .collection(collectionPath)
            .doc(newDoc["_id"])
            .set(newDoc, { merge: true });
        })
    }

    /*update()*/
    //
    //Parametros:
    //
    protected update(updatedDoc:TModel, nomCollection:string, _pathBase=""){
        
        let collectionPath = (_pathBase === "") ?
                            `${nomCollection}` :
                            `${_pathBase}/${nomCollection}`

        return Fb_app.firestoreReady()
        .then(() => {
            return Fb_app.firestore()
            .collection(collectionPath)
            .doc(updatedDoc["_id"])
            .update(updatedDoc);
        })
    }

    /*delete()*/
    //
    //Parametros:
    //
    public delete(_id:string, nomCollection:string, _pathBase=""){

        let collectionPath = (_pathBase === "") ?
                            `${nomCollection}` :
                            `${_pathBase}/${nomCollection}`

        return Fb_app.firestoreReady()
            .then(() => {
                return Fb_app.firestore()
                    .collection(collectionPath)
                    .doc(_id)
                    .delete();
            })
    }

}
