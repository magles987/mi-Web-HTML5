import { FirebaseConfig } from "../../../ts/firebase-config";
import { Fb_Controller } from "../fb-controller";

import { Producto, IProducto } from "../../models/producto/producto-m";
import { ProductoMeta } from "./producto-meta";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*class ProductoController extends Fb_Controller*/
//
export class ProductoController extends Fb_Controller<Producto, IProducto<any>, ProductoMeta>{

    constructor(){
        super();
        //configurar los metadatos tanto el offline como el de cloudFn
        this.modelMeta_Offline = new ProductoMeta();
        this.updateMetada().catch((error)=>{ console.log(error)});

    }

    /*getAllDocs()*/
    //Lee todos los documentos de la coleccion 
    //Parametros:
    //
    //_pathBase: si el modelo de este controller pertenece a 
    //una subcoleccion es necesario recibir un pathBase para 
    //construir la ruta de la query
    public getAllDocs(_pathBase?:string){
        
        const isCollectionGroup = false;
        const mMeta = this.modelMeta || this.modelMeta_Offline;

        //declarar cursor de consulta
        let cursorQuery:firebase.firestore.Query<firebase.firestore.DocumentData>
        
        //configuracion de acuerdo al tipo de consulta normal o group
        //se puede omitir si se tiene la seguridad de usar el tipo de consulta
        //por ejemplo: si es una coleccion raiz es seguro que NO se necesitará 
        //consulta de tipo collectionGroup 
        if (!(isCollectionGroup && mMeta.__isEmbSubcoleccion)) {
            cursorQuery = this.FB.app_FS
            .collection(this.UtilCtrl.getPathCollection(mMeta, _pathBase))
            .orderBy(mMeta._id.nom, 'asc')
            .limit(3);            
        } else {
            cursorQuery = this.FB.app_FS
            .collectionGroup(this.UtilCtrl.getPathCollection(mMeta, _pathBase))
            .orderBy(mMeta._id.nom, 'asc')
            .limit(50);
        }
 
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
        
        const mMeta = this.modelMeta || this.modelMeta_Offline;

        let cursorRef_id = this.FB.app_FS
        .collection(mMeta.__nomColeccion).doc(_id);

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
    public createDoc(newDoc:Producto, _pathBase?:string){
        //aqui se puede usar un hook pre-crear
        newDoc = newDoc;
        return this.create(newDoc, _pathBase)
        .then(() => {
            //aqui se puede usar un hook post-crear 
            return;
        });
    }

    /*update()*/
    //
    //Parametros:
    //
    public updateDoc(updatedDoc:Producto, _pathBase?:string){
        //aqui se puede usar un hook pre-editar
        updatedDoc = updatedDoc;

        return this.update(updatedDoc, _pathBase)
        .then(() => {
            //aqui se puede usar un hook post-actualizar
            return;
        });
    }

    /*deleteDoc()*/
    //
    //Parametros:
    //_id: el id del doc a eliminar
    public deleteDoc(_id:string, _pathBase?:string){
        //aqui se puede usar un hook pre-eliminar
        return this.delete(_id, _pathBase)
        .then(() => {
            //aqui se puede usar un hook post-eliminar
            return;
        });
    }
}