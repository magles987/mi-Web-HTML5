import { Fb_app } from "../../../ts/firebase-config";
import { Fb_Controller } from "../fb-controller";

import { Producto } from "../../models/producto/producto-m";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*class ProductoController extends Fb_Controller*/
//
export class ProductoController extends Fb_Controller<Producto>{

    private nomCollection = "Productos";


    constructor(){
        super()
    }

    /*getAllDocs()*/
    //
    //Parametros:
    //
    public getAllDocs(){
        
        let cursorQuery = Fb_app.firestore()
        .collection(this.nomCollection)
        .orderBy('_id', 'asc')
        .limit(50);
       
        return this.getDocs(cursorQuery)
        .then((preDocs) => {
            //aqui se puede hacer un hook de lectura
            let docs = preDocs;
            return docs;
        });
    }

    /*getDocBy_id()*/
    //
    //Parametros:
    //
    public getDocBy_id(_id:string){
        
        let cursorRef_id = Fb_app.firestore()
        .collection(this.nomCollection).doc(_id);

        return this.getBy_id(cursorRef_id)
        .then((preDoc) => {
            //aqui se puede hacer un hook de lectura
            let docs = preDoc;
            return docs;
        });
    }

    /*createDoc()*/
    //
    //Parametros:
    //
    public createDoc(newDoc:any, _pathBase?:string){
        //aqui se puede usar un hook pre-crear
        newDoc = newDoc;
        return this.create(newDoc, this.nomCollection, _pathBase)
        .then(() => {
            //aqui se puede usar un hook post-crear 
            return;
        });
    }

    /*update()*/
    //
    //Parametros:
    //
    public updateDoc(updatedDoc:any, _pathBase?:string){
        //aqui se puede usar un hook pre-editar
        updatedDoc = updatedDoc;

        return this.update(updatedDoc, this.nomCollection, _pathBase)
        .then(() => {
            //aqui se puede usar un hook post-actualizar
            return;
        });
    }

    /*deleteDoc()*/
    //
    //Parametros:
    //
    public deleteDoc(_id:string, _pathBase?:string){
        //aqui se puede usar un hook pre-eliminar
        return this.delete(_id, this.nomCollection, _pathBase)
        .then(() => {
            //aqui se puede usar un hook post-eliminar
            return;
        });
    }
}