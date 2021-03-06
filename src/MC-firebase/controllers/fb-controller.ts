import * as firebase from "firebase/app";
import { FirebaseConfig } from "../../ts/firebase-config/firebase-config";
import { AxiosHandler } from "../../ts/axios-handler";

import { UtilControllers } from "./util-ctrl";
import { ModelMetadata, IReqDataMeta, ETypeCollection, IFieldMeta, EFieldType } from "./meta";

import { HookHandler, IHookParams } from "./hook-handler";
import { FilterHandlerCtrl, IFilter, IPopulationFilter } from "./filter-handler";
import { Formatter } from "./formatter";
import { Fb_Paginator } from "./fb-paginator";
import { RelationshipHandler } from "./relationship-handler";
import { Validator } from "./validator";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *abstract class* `Fb_Controller`  
 * Permite factorizar metodos usados en cada controller asignado 
 * para cada modelo de la BD de Firestore de la suite de Firebase
 * ____
 * *Types:*  
 * `TModel` : Representa el Modelo (class) del controller  
 * `TIModel` : Representa el Modelo (Interface) del controller  
 * `TModelMeta` : Representa la metadata del modelo del controller  
 * ____
 */
export abstract class Fb_Controller<TModel,TIModel, TModelMeta>{

    /** *protected*  
     * Contiene la instancia que representa la api 
     * de Firebase del lado cliente
     * ____
     */
    protected FB:FirebaseConfig;

    /** *protected*  
     * Instancia de la metadata del modelo correspondiente, 
     * se debe instanciar en el controller correspondiente
     * ____
     */
    protected modelMeta:TModelMeta;
    /** *protected*  
     * Instancia de la metadata del modelo correspondiente, 
     * contiene una copi offline del ultimo metadata 
     * descargada en caso que no se pueda conectar al servidor
     * ____
     */
    protected modelMeta_Offline:TModelMeta;

    /** *protected*  
     * representa el validador de datos para el modelo.  
     * **Importante**
     * esta propiedad se debe inicializar en los controllers 
     * correspondientes a cada modelo (los hijos de 
     * esta clase)
     * ____
     */
    protected modelValidator: Validator;

    /** *protected*  
     * representa el formateador de valores para el modelo.  
     * **Importante**
     * esta propiedad se debe inicializar en los controllers 
     * correspondientes a cada modelo (los hijos de 
     * esta clase)
     * ____
     */
    protected modelFormatter: Formatter;

    /** *protected*  
     * representa el manejador de filtrado para este modelo.  
     * **Importante**
     * esta propiedad se debe inicializar en los controllers 
     * correspondientes a cada modelo (los hijos de 
     * esta clase)
     * ____
     */
    protected modelFilterHandler: FilterHandlerCtrl<TIModel>;

    /** *protected*  
     * representa el manejador de hooks para este modelo.  
     * **Importante**
     * esta propiedad se debe inicializar en los controllers 
     * correspondientes a cada modelo (los hijos de 
     * esta clase)
     * ____
     */
    protected modelHookHandler: HookHandler<TModel, TModelMeta>;

    /** *protected*  
     * ...
     */
    protected paginator: Fb_Paginator;

    /** *protected*  
     * ...
     */
    protected relationshipHandler: RelationshipHandler<TModel, TModelMeta>;    

    /** *protected*  
     * utilitarios para el controller
     * ____
     */
    protected UtilCtrl:UtilControllers;

    //???
    protected isServiceReady:Boolean;
    
    /** 
     * `constructor()`  
     * se deben inicializar las propiedades que 
     * puedan tener asignacion predefinida y no 
     * especifica por cada controller
     * ____
     */
    constructor() {
        this.FB = FirebaseConfig.getInstance();
        this.UtilCtrl = UtilControllers.getInstance();
    }

    /** 
     * *protected*  
     * descarga (si se puede) el *ModelMeta* mas actual desde *cloudFunction* 
     * por medio de function de tipo `onCall` y lo actualiza al *controller* 
     * correspondiente; si no es posible actualizar se asigna la metadata 
     * offline que se tenga almacenada.  
     * devuelve una promesa (sin importar si se pudo o no descargar)
     * indicando la actualizacion
     * ____
     */
    protected updateModelMetada():Promise<void>{

        //­­­___ <TEST> _____________________________________
        //New: puente que evita ejecucion de cloud funtions
        let enprueba =1;
        if (enprueba == 1) {
            this.modelMeta = this.modelMeta_Offline;
            return Promise.resolve()
            //;
        }        
        
        //________________________________________________
        //Old: no debe haber puente
        
        //________________________________________________



        //extraer part de modelo meta en *frio*
        const mMeta = <ModelMetadata><unknown>this.modelMeta_Offline;

        //cargar los datos de peticion (parametros para cloudFunctions)
        const ReqData:IReqDataMeta = {
            __nomModel : mMeta.__nomModel
        };

        //configurar y realizar la llamada a la cloudFunction por medio de onCall 
        const fn_onCall = this.FB.callFnWithOnCall(mMeta.__getCloudFnMeta, ReqData)
        return fn_onCall.then((resultMeta) => {
            if (resultMeta && resultMeta != null) {
                this.modelMeta = <TModelMeta><unknown>resultMeta;
                /** tambien se actualiza en el populator
                 * esta actualizacion debe ser asincronica 
                 * ya que tiene que haberse inicializado 
                 * la propiedad this.populator
                */
                this.relationshipHandler.updateModelMetada(this.modelMeta);    
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

    /** 
     * *protected*  
     * configuracion de acuerdo al tipo de consulta 
     * normal o group se puede omitir si se tiene la 
     * seguridad de usar el tipo de consulta por 
     * ejemplo: si es una coleccion raiz es seguro 
     * que NO se necesitará consulta de tipo 
     * collectionGroup
     * 
     * *Param:*  
     * `cursorQuery` : cursor constructor de la consulta.  
     * `filter` : objeto con la configuracion del filtro 
     * a usar en la consulta.  
     * ____
     */
    protected configTypeCollectionQuery(
        cursorQuery:firebase.firestore.Query<firebase.firestore.DocumentData>,
        filter:IFilter<TIModel>        
    ):firebase.firestore.Query<firebase.firestore.DocumentData>{
        //extraer part de modelo meta
        const mMeta = <ModelMetadata><unknown>this.modelMeta;
        
        const pathCollection = this.UtilCtrl.getPathCollection(mMeta, filter._pathBase);
        
        cursorQuery = (!(filter.isCollectionGroup && mMeta.__typeCollection == ETypeCollection.subCollection)) ? 
                this.FB.app_FS.collection(pathCollection) :
                this.FB.app_FS.collectionGroup(pathCollection);
        
        return cursorQuery;
    }

    /** 
     * *protected*  
     * configuracion comun de limite y paginacion para 
     * todas las querys para todos lo modelsCtrl
     * 
     * *Param:*  
     * `cursorQuery` : cursor constructor de la consulta.  
     * `filter` : objeto con la configuracion del filtro 
     * a usar en la consulta.  
     * ____
     */
    protected configLimitAndPaginateQuery(
        cursorQuery:firebase.firestore.Query<firebase.firestore.DocumentData>,
        filter:IFilter<TIModel>  
    ):firebase.firestore.Query<firebase.firestore.DocumentData>{
        
        const configPre = this.paginator.configParamsPaginateForQuery(filter);

        /**seleccion de metodo limit a aplicar segun tipo 
         * y direccion de paginacion*/

        if (configPre.typeLimitMethod == "limit-method") {
            cursorQuery = cursorQuery.limit(configPre.limit);
        }
        if (configPre.typeLimitMethod == "limitToLast-method") {
            cursorQuery = cursorQuery.limitToLast(configPre.limit);
        }

        /**seleccion de metodo de paginacion (punto de inicio) */

        /** permite paginacion directa excluyendo en la consulta el snapShotDoc 
         * que se le pase como referencia (normalmente usado con metodo limit)*/        
        if (configPre.initialMethod == "startAfter") {
            cursorQuery = cursorQuery.startAfter(configPre.SSDForQuery)
        }
        
        /** permite paginacion directa incluyendo en la consulta el snapShotDoc 
         * que se le pase como referencia (normalmente usado con metodo limit)*/        
        if (configPre.initialMethod == "startAt") {
            cursorQuery = cursorQuery.startAt(configPre.SSDForQuery)
        }        

        /** permite paginacion reversible excluyendo en la consulta el snapShotDoc 
         * que se le pase como referencia (normalmente usado con limitToLast)*/
        if (configPre.initialMethod == "endBefore") {
            cursorQuery = cursorQuery.endBefore(configPre.SSDForQuery)
        }

        /** permite paginacion reversible incluyendo en la consulta el snapShotDoc 
         * que se le pase como referencia (normalmente usado con limitToLast)*/        
        if (configPre.initialMethod == "endAt") {
            cursorQuery = cursorQuery.endAt(configPre.SSDForQuery)
        }        

        return cursorQuery;
    }

    /** 
     * *protected*  
     * Factoriza el codigo final para solicitar la lectura de documentos 
     * a Firestore ejecutando la query.
     * 
     * Por ahora la opcion de lectura es **NO en tiempo real**, no se 
     * tiene habilitado la lectura por medio de observables
     * 
     * *Param:*  
     * `cursorQuery` : Contiene el cursor preconfigurado 
     * con la consulta a realizar.  
     * `filter` : la configuracion del filtro usado para 
     * armar la query.  
     * `hookParams` : la configuracion para los metodos hooks  
     * ____
     */
    protected execQuery(
        cursorQuery:firebase.firestore.Query<firebase.firestore.DocumentData>,
        filter:IFilter<TIModel>,
        hookParams:IHookParams        
    ){

        return Promise.resolve() //inicio de cadena de promesas (solo para comodidad de desmontar promesas qu eno hagan falta)         
        //ejecutar el preHook
        .then(()=>this.modelHookHandler.preGet(hookParams))
        //ejecutar la lectura
        .then(()=>{            
            /**Lectura NO en tiempo real */
            return cursorQuery.get()
            .then((docsData) => {

                /**Convertirlo a un array normal
                 * ya que en la documentacion se 
                 * trabaja como *iterable*
                 */
                const snapDocs = docsData.docs;

                /**procesa los snapShotDocumens 
                 * recibidos y organiza en paginas */
                let docsRes = <TModel[]> this.paginator.postPaginatePostQuery(snapDocs, filter);

                //---aqui algo mas si se desea hacer con los documentos---

                return docsRes;
            });
            
            /**Lectura en tiempo real (No implementada) */
            // return cursorQuery.onSnapshot({
            //     // aqui el objeto para el observable
            // });
        })
        //ejecutar el postHook
        .then((docs) => this.modelHookHandler.postGet(docs, hookParams));
    }

    /** 
     * *public*  
     * Lee un solo documento de acuerdo al _id
     * 
     * *Param:*  
     * `_id` : el id del documento a leer.  
     * `_pathBase` : al tener solo el _id del 
     * documento es necesario enviar un _pathBase 
     * si este documento esta almacenado en 
     * una *subcoleccion*.  
     *`hookParams` : Parametros para los metodos hooks 
     * (pre y post) a la ejecucion de la lectura  
     * ____
     */    
    public getBy_id(
        _id:string, 
        hookParams?:IHookParams,
        _pathBase="", 
    ){
        //configuracion personalizada para el hookParams
        hookParams = (hookParams && hookParams != null) ? 
                     hookParams : this.getDefHookParamsInstance();

        return <Promise<TModel>>this.exec_id_Or_pathDoc(hookParams, _id, "", _pathBase);
    }
    
    /** 
     * *public*  
     * Lee un solo documento de acuerdo al _pathDoc
     * 
     * *Param:*  
     * `_pathDoc` : el _pathDoc del documento a leer.  
     *`hookParams` : Parametros para los metodos hooks 
     * (pre y post) a la ejecucion de la lectura  
     * ____
     */    
    public getBy_pathDoc(_pathDoc:string, hookParams?:IHookParams){
        //configuracion personalizada para el hookParams
        hookParams = (hookParams && hookParams != null) ? 
                     hookParams : this.getDefHookParamsInstance();

        return <Promise<TModel>>this.exec_id_Or_pathDoc(hookParams, "", _pathDoc, );
    }

    /** 
     * *protected*  
     * Factoriza el codigo final para solicitar la lectura 
     * de **un solo** documento a traves de su _id, tambien verifica  
     * los validadores, handlers y hooks generales previos 
     * antes de realizar la lectura
     * 
     * *Param:*  
     * `cursorQuery` : Contiene el cursor preconfigurado 
     * con la consulta a realizar para un solo documento   
     * ____
     */
    private exec_id_Or_pathDoc(
        hookParams:IHookParams,
        _id="",
        _pathDoc="",
        _pathBase=""
    ){


        if ((!_id || _id == null || _id == "") && 
            (!_pathDoc || _pathDoc == null || _pathDoc == "" )
        ) {
            throw new Error("no exixte ni _id ni _pathDoc para crear la consulta");            
        }      

        //configuracion especial si se usa _pathDoc, del cual se 
        //extrae la informacion necesaria para la ruta
        if (_pathDoc && _pathDoc != null && _pathDoc != "") {
            _id = this.UtilCtrl.get_idWithout_pathDoc(_pathDoc);
            _pathBase = this.UtilCtrl.get_pathDocWithout_id(_pathDoc);
        }

        return Promise.resolve() //inicio de cadena de promesas (solo para comodidad de desmontar promesas qu eno hagan falta) 
        //ejecutar el preHook
        .then(()=>this.modelHookHandler.preGet(hookParams))
        //ejecutar la lectura
        .then(() => {

            const mMeta = <ModelMetadata><unknown>(this.modelMeta || this.modelMeta_Offline);

            //seleccion la fuente de creacion de pathCollection de acuerdo a 
            //como se construido la consulta (si con _id o con _pathDoc)
            const pathCollection = (_pathDoc && _pathDoc != null && _pathDoc != "") ?
                                    this.UtilCtrl.get_pathDocWithout_id(_pathDoc) : 
                                    this.UtilCtrl.getPathCollection(mMeta, _pathBase);

            //cursorQuery para un solo documento por _id
            let cursorRef_id = this.FB.app_FS.collection(pathCollection).doc(_id);
            
            return  cursorRef_id.get()
            .then((docData) => {
                let doc = docData.data() as TModel;
                return doc;
            });
        })
        //ejecutar el postHook
        .then((docs) => this.modelHookHandler.postGet(docs, hookParams));
    }
    
    /** 
     * *public*  
     * Consulta especial para retornar los documentos que 
     * tengan referencias a una coleccion en concreto
     * 
     * *Param:*  
     * `_docOrigin` se recibe un extracto de objeto con 
     * con las propiedades referenciales o el objeto origen
     * para consultar.  
     * `nomField_Ref` el nombre del campo que contiene 
     * las referencias (_id o _pathDoc o incluso el objeto clon)
     * ____
     */
    public getDocsByRefence(
        _docOrigin:any,
        nomRefField:string
    ):Promise<TModel | TModel[]>{
        
        //metadata a usar
        const mMeta = <ModelMetadata><unknown>this.modelMeta || this.modelMeta_Offline;
        const fMeta = <IFieldMeta<unknown, any>><unknown>mMeta[nomRefField];

        /**configuracion de filtro obligatoria para 
         * esta Query*/
        let filter = this.getDefFilterInstance();
        filter.isCollectionGroup = false; //--falta analisis

        //configuracion comun para el hookParams
        let hookParams = this.getDefHookParamsInstance();
        hookParams = (hookParams && hookParams != null) ? 
                     hookParams : this.getDefHookParamsInstance();

        //================================================================
        //Constructor de Query

        //declarar cursor de consulta
        let cursorQuery:firebase.firestore.Query<firebase.firestore.DocumentData>
        
        /**Determinar tipo de coleccion (normal o group) */
        cursorQuery = this.configTypeCollectionQuery(cursorQuery, filter);
              
        /**selecciona el campo de busqueda de acuerdo a al configuracion */

        let _refQ:string;
        let nomPath:string;

        if (fMeta.structureFConfig.typeRef == "_pathDoc") {
            _refQ =  _docOrigin["_pathDoc"];
            nomPath = this.UtilCtrl.getPathField(this.modelMeta, nomRefField);
            
        /**Configurar el cursorQuery dependiendo de la carnidalidad 
         * del campo referencia (sencillo si es (0a1,1a1) array 
         * si es (0aMuchos, 1aMuchos)) dada por la propiedad default */  
            if (fMeta.structureFConfig.cardinality == "one") {            
                cursorQuery = cursorQuery.where(nomPath, "==", _refQ);
            }
            if (fMeta.structureFConfig.cardinality == "many") {//solo para referencias no para objetos
                cursorQuery = cursorQuery.where(nomPath, "array-contains", _refQ);
            }
        }

        if (fMeta.structureFConfig.typeRef == "_docClone"){
            _refQ = _docOrigin["_pathDoc"]; //---falta analisis
            const prefix_id = this.UtilCtrl.get_idWithout_pathDoc(_refQ);
            
            if (fMeta.structureFConfig.cardinality == "one") {
                nomPath = this.UtilCtrl.getPathField(this.modelMeta, nomRefField, "", "_pathDoc");
            }
            if (fMeta.structureFConfig.cardinality == "many") {
                nomPath = this.UtilCtrl.getPathField(this.modelMeta, nomRefField, prefix_id, "_pathDoc");                
            }
    
            cursorQuery = cursorQuery.where(nomPath, "==", _refQ);
        }      

        //ejecutar la consulta en comun
        return Promise.resolve()
        //--preHooks??
        //ejecutar la lectura
        .then(()=>{      
            /**Lectura NO en tiempo real para las referencias*/
            return cursorQuery.get()
            .then((docsData) => {

                /**Convertir los snapshots a documentos del modelo */
                let docsRes:TModel[] = docsData.docs.map((docSnap) => {
                    const doc = docSnap.data() as TModel;
                    //...aqui si se requiere procesar algo mas para cada doc
                    return doc
                });

                return docsRes;
            });
 
        })
        //--postHooks??
    }

    /** 
     * *public*  
     * factoriza la ejecucion previa a la creacion del nuevo documento, 
     * realiza las ultimas validaciones globales, hooks generales y 
     * alistamiento de la BD Firestore
     * 
     * *Param:*  
     * `newDoc` : el nuevo docuemnto a crear en Firestore.  
     * `hookParams` : Parametros para los metodos hooks 
     * (pre y post) a la ejecucion de la modificacion.  
     * `_pathBase` : ruta inicial para acceder a las subcolecciones
     * (las colecciones Raiz no lo requieren).  
     * `ext_id` : si se desea usar un _id de proveedor externo
     * ____
     */
    public create(
        newDoc:TModel, 
        hookParams:IHookParams, 
        _pathBase:string, 
        ext_id:any, 
    ){
        return Promise.resolve() //inicio de cadena de promesas (solo para comodidad de desmontar promesas qu eno hagan falta) 
        //actualizar la metadata
        .then(() => this.updateModelMetada())
        //formatear el documento a crear
        .then(() => {
            const Ft = this.modelFormatter
            return Ft.formatDocWithPromise(newDoc, this.modelMeta, _pathBase, ext_id, false);
        })
        //poblar _docClone (si existen) para ser almacenados en la BD
        .then(()=>this.relationshipHandler.populateDocClone(newDoc, hookParams, _pathBase))           
        //ejecutar preHook
        .then((nDoc)=>this.modelHookHandler.preCreate(nDoc, this.modelMeta, hookParams))
        //ejecutar creacion (documento ya Validado y Formateado)
        .then((newFVDoc) => {

            //extraer part de modelo meta
            const mMeta = <ModelMetadata><unknown>this.modelMeta;
            const collectionPath = this.UtilCtrl.getPathCollection(mMeta, _pathBase);

            return this.FB.app_FS
            .collection(collectionPath)
            .doc(newFVDoc["_id"])
            .set(newFVDoc, { merge: true });
        })
        //ejecutar postHook
        .then(()=>this.modelHookHandler.postCreate(newDoc, hookParams))
    }

    /** 
     * *public*  
     * factoriza la ejecucion previa a la actualizacion del documento, 
     * realiza las ultimas validaciones globales, hooks generales y 
     * alistamiento de la BD Firestore
     * 
     * *Param:*  
     * `updatedDoc` : el docuemnto con los cambios a actualizar 
     * en Firestore.  
     * `hookParams` : Parametros para los metodos hooks 
     * (pre y post) a la ejecucion de la modificacion.  
     * `_pathBase` : ruta inicial para acceder a las subcolecciones
     * (las colecciones Raiz no lo requieren).  
     * `isStrongUpdate` : determina si se desea un aactualizacion 
     * fuerte para los campos estructurales *map_*
     * ____
     */
    public update(
        updatedDoc:TModel, 
        hookParams:IHookParams,        
        _pathBase:string, 
        isStrongUpdate:boolean,         
    ){
        return Promise.resolve() //inicio de cadena de promesas (solo para comodidad de desmontar promesas qu eno hagan falta) 
        //actualizar la metadata
        .then(() => this.updateModelMetada())
        //formatear el documento a actualizar
        .then(() => {
            const Ft = <Formatter><unknown>this.modelFormatter
            return Ft.formatDocWithPromise(updatedDoc, this.modelMeta, _pathBase, null, isStrongUpdate);
        })
        //poblar _docClone (si existen) para ser almacenados en la BD
        .then(()=>this.relationshipHandler.populateDocClone(updatedDoc, hookParams, _pathBase))        
        //ejecutar preHook
        .then(()=>this.modelHookHandler.preUpdate(updatedDoc, this.modelMeta, hookParams))
        //ejecutar la actualizacion
        .then(() => {

            //extraer part de modelo meta
            const mMeta = <ModelMetadata><unknown>this.modelMeta;
            const collectionPath = this.UtilCtrl.getPathCollection(mMeta, _pathBase);

            return this.FB.app_FS
            .collection(collectionPath)
            .doc(updatedDoc["_id"])
            .update(updatedDoc);
        })
        //ejecutar integridad de datos
        .then(()=>this.relationshipHandler.modifyReference("update", updatedDoc, _pathBase))        
        //ejecutar postHook
        .then(()=>this.modelHookHandler.postUpdate(updatedDoc, hookParams))
    }

    /** 
     * *public*  
     * factoriza la ejecucion previa a la eliminacion del documento, 
     * realiza las ultimas validaciones globales, hooks generales y 
     * alistamiento de la BD Firestore
     * 
     * *Param:*  
     * `deletedDoc` : el documento a eliminar de la base 
     * de datos, se usa el documento completo y no su _id
     *  con el fin de aprovechar los hooks internos.   
     * `hookParams` : Parametros para los metodos hooks 
     * (pre y post) a la ejecucion de la modificacion.  
     * `_pathBase` : ruta inicial para acceder a las subcolecciones
     * (las colecciones Raiz no lo requieren)
     * ____
     */
    public delete(
        deletedDoc:TModel, 
        hookParams:IHookParams, 
        _pathBase:string, 
    ){
        return Promise.resolve() //inicio de cadena de promesas (solo para comodidad de desmontar promesas qu eno hagan falta) 
        //actualizar la metadata
        .then(() => this.updateModelMetada())
        //ejecutar preHook
        .then(()=>this.modelHookHandler.preDelete(deletedDoc, this.modelMeta, hookParams))            
        //ejecutar la actualizacion
        .then(() => {

            //extraer part de modelo meta
            const mMeta = <ModelMetadata><unknown>this.modelMeta;
            const collectionPath = this.UtilCtrl.getPathCollection(mMeta, _pathBase);
            const _id = deletedDoc["_id"]

            return this.FB.app_FS
                .collection(collectionPath)
                .doc(_id)
                .delete();
        })
        //ejecutar integridad de datos
        .then(()=>this.relationshipHandler.modifyReference("remove", deletedDoc, _pathBase))
        //ejecutar postHook
        .then(()=>this.modelHookHandler.postDelete(deletedDoc, hookParams))        
    }    

    //================================================================
    //Utilitarios acceso    

    /** 
     * *public*  
     * retorna la instancia actual usada 
     * como ModelMeta
     * ____
     */
    public getModelMeta():TModelMeta{
        const r = this.modelMeta
        return r;
    };   

    /** 
     * *public*  
     * retorna la instancia actual del paginador 
     * para este modelo
     * ____
     */
    public getModelPaginator():Fb_Paginator{
        let r = this.paginator;
        return r;
    };    

    /** 
     * *public abstract*  
     * retorna la instancia actual del Validador usado
     * para este modelo
     * ____
     */
    // public abstract getModelValidator():Validator; 
        

    /** 
     * *public abstract*  
     * retorna la instancia actual del formateador usado
     * para este modelo
     * ____
     */
    public abstract getModelFormatter():Formatter;   

    /** 
     * *public abstract*  
     * retorna la instancia actual del poblador
     * para manejo de campos especiales como 
     * *fk_* y *emb_*
     * ____
     */
    public abstract getModelPopulator():RelationshipHandler<TModel, TModelMeta>;    

    /** 
     * *public abstract*  
     * retorna una instancia prototipada (un clon)
     * de *modelFilter* con los valores por default para
     * ser modificados externamente
     * 
     */
    public abstract getDefFilterInstance():IFilter<TIModel>;

    /** 
     * *public abstract*  
     * retorna una instancia prototipada (un clon)
     * de *modelPopulationFilter* con los valores 
     * por default para ser modificados externamente
     * 
     */
    public abstract getDefPopulationFilterInstance():IPopulationFilter<TIModel>;

    /** 
     * *public abstract*  
     * retorna una instancia prototipada (un clon)
     * de ModelHookParams con los valores por default para
     * ser modificados externamente
     * 
     */
    public abstract getDefHookParamsInstance():IHookParams;

    //================================================================
    //test 

    /** 
     * *public*  
     * descrip...
     * ____
     */
    public createDocsTest(
        numDocs?:number,
        docsBase?:TModel[]
    ){

        let docs_test = <TModel[]>[];

        if (Array.isArray(docsBase) && docsBase.length == 0) {
            
        }else{
            numDocs = (!numDocs || numDocs == null) ?
                      10 : numDocs;

            const mm = <ModelMetadata><unknown> this.modelMeta;
            for (let index = 0; index < numDocs; index++) {
                docs_test.push(this.UtilCtrl.createEmptyModel(mm));
                
            }
        }

        const ih = <IHookParams>{}
        const _p = "";
        const e = null;

        const pms = docs_test.map((dt) => {  
            return this.create(dt, ih, _p, e);
        });

        return Promise.all(pms);
    }
    

}
