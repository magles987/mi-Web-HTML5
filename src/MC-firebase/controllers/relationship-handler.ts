import { Fb_Controller } from "./fb-controller";
import { IPopulationFilter } from "./filter-handler";
import { IFieldMeta, EFieldType, ModelMetadata } from "./meta";
import { Fb_Paginator } from "./fb-paginator";
import { IHookParams } from "./hook-handler";
import { Model } from "../models/model";
import { UtilControllers } from "./util-ctrl";


//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *abstract class*  
 * administra todo lo referente a la relaciones 
 * entre colecciones y subcolecciones
 * ____
 * *Types:*  
 * `TModel` : tipado del modelo.
 * `TModelMeta` : tipado de la metadata  
 * ____
 */
export abstract class RelationshipHandler<TModel, TModelMeta>{
    
    /** *protected*  
     * descrip...
     * ____
     */
    protected modelMeta:TModelMeta;

    /** *protected*  
     * descrip...
     * ____
     */
    protected populatePaginator:Fb_Paginator;

    /** *private*  
     * utilidades para las clases pertenecientes 
     * al controller
     * ____
     */
    private util_ctrl:UtilControllers;
        
    /** 
     * `constructor()`  
     * descrip...
     * ____
     */
    constructor() {
        this.util_ctrl = UtilControllers.getInstance();
    }

    //================================================================================================================================  
    //REFERNETE A POPULATOR

    /** 
     * *protected abstract*  
     * 
     * ____
     */
    protected abstract getInputCtrls():Map<string, ()=>Fb_Controller<any,any,any>>;
    
    /** 
     * *protected abstract*  
     * Contiene un array con las funciones para llamar a **todas** las referencias 
     * de los controladores **externos** mismo controlador llamado de forma recursiva 
     * asociado a "this")que se relacionan con campos de este modelo
     * ____
     */
    protected abstract getOutputCtrls():[()=>Fb_Controller<unknown,unknown,unknown>];    

    /** 
     * *public*  
     * permite poblar campos referencia
     * 
     * *Param:*  
     * `_pathDocsOr_ids` : array con las referencias en 
     * string a paginar (pueden ser _pathDocs o _ids).  
     * `nomRefField` : el nombre del campo que contiene las referencias.  
     * `populatorFilter` : la configuracion del filtro 
     * exclusivo para poblar.  
     * "_pathDoc" o "_id".  
     * `hookParams` : los parametros hooks para cada documento
     * a poblar.  
     * `_pathBase` : si se usa referencias _id y si es un 
     * documento contenido en una subcoleccion (embebido) 
     * se debe **recibir** este parametro.  
     * ____
     */
    public populateField<TField>(
        _pathDocsOr_ids:string | string[], 
        nomRefField:string,
        populatorFilter:IPopulationFilter<unknown>,        
        hookParams?:IHookParams,
        _pathBase = "",
    ):Promise<TModel[]>{

        if (populatorFilter.isPopulate == false) {
            /*Debe devolver un vacio ya que no se puede poblar*/
            return Promise.resolve([]);
        }

        if (!this.modelMeta[nomRefField] || this.modelMeta[nomRefField] == null) {
            throw new Error(nomRefField + "no tiene campo referencial asignado"); 
        }

        const fMeta = <IFieldMeta<TField,any>>this.modelMeta[nomRefField];
        
        if (fMeta.fieldType != EFieldType.foreign 
            || !fMeta.structureFConfig || fMeta.structureFConfig == null
            || !fMeta.structureFConfig.extModelMeta || fMeta.structureFConfig.extModelMeta == null
        ) {
            throw new Error("no es un campo populable");            
        }

        /*Determinar existencia de referencias a poblar */
        if (!_pathDocsOr_ids || _pathDocsOr_ids == null ||
            (Array.isArray(_pathDocsOr_ids) && _pathDocsOr_ids.length == 0)
        ) {
            /*Cardinalidad 0 */
            return (Array.isArray(_pathDocsOr_ids)) ?
                    Promise.resolve([]) :
                    Promise.resolve(null) ;
        }

        /*Cardinalidad Muchos */
        //No se requiere trato especial

        /*Para cualquier cardinalidad se hace un cast de array */
        _pathDocsOr_ids = (Array.isArray(_pathDocsOr_ids)) ? _pathDocsOr_ids : [_pathDocsOr_ids];

        //actualizar la cantidad de referencias a poblar
        populatorFilter.populateSize = _pathDocsOr_ids.length;

        /**Configurar controller externo */
        const ext_MMeta = this.getExtModelMeta(fMeta.structureFConfig.extModelMeta);
        const ext_Ctrl = this.getInputCtrlByNomModel(ext_MMeta.__nomModel);
        const ext_paginator = ext_Ctrl.getModelPopulator().getPopulatePaginator();

        /*si se pagína almacena una parte de
        toda la lista de _pathDocs o todo el 
        listado si no se pagína
        */
        let extract_pathDocs = ext_paginator.configParamsPopulateForPaginate(_pathDocsOr_ids, populatorFilter);        
        let populationPromises = extract_pathDocs.map((_pathDocOr_id)=>{
            
            if (fMeta.structureFConfig.typeRef == "_pathDoc") {
                return ext_Ctrl.getBy_pathDoc(_pathDocOr_id, hookParams);
            }
            /**retorna la referencia sin
             *  alterar (en tipo string) */
            return Promise.resolve(_pathDocOr_id)     
                     
        });

        return Promise.all(populationPromises)
        .then((docs)=>{

            /**post paginar y Actualizar el elemento del mapa */
            docs = ext_paginator.postPopulationPaginate(docs, populatorFilter);

            return docs as TModel[];
        });
    }    

    /** 
     * *public*  
     * a partir de un 
     * 
     * *Param:*  
     * `pm1`  
     * ____
     */
    public populateFieldClone(
        doc:TModel,
        nom_refCloneField:string,
        hookParams?:IHookParams,
        _pathBase="",      
    ):Promise<TModel>{

        const mMeta = <ModelMetadata><unknown>this.modelMeta;
        const ref_fMeta = <IFieldMeta<unknown, any>>mMeta[nom_refCloneField];
        
        /*comprobacion de propiedades de metadata para el 
        campo que almacena _pathDoc de referencia*/
        if (!doc
            || doc == null            
            || !doc[nom_refCloneField] 
            || doc[nom_refCloneField] == null
            || !ref_fMeta.structureFConfig  
            || ref_fMeta.structureFConfig == null 
            || !ref_fMeta.structureFConfig.extModelMeta  
            || ref_fMeta.structureFConfig.extModelMeta == null 
            || !ref_fMeta.structureFConfig.typeRef  
            || ref_fMeta.structureFConfig.typeRef == null 
            || !ref_fMeta.structureFConfig.cardinality  
            || ref_fMeta.structureFConfig.cardinality == null
            
            || ref_fMeta.fieldType != EFieldType.foreign
            || ref_fMeta.structureFConfig.typeRef != "_docClone"
        ) {
            return Promise.resolve(doc);
        }

        /*recoge las propiedades necesarias para analizar 
        el ctrl que se esta mapeando */
        const ext_MMeta = this.getExtModelMeta(ref_fMeta.structureFConfig.extModelMeta);
        const ext_ctrl = this.getInputCtrlByNomModel(ext_MMeta.__nomModel);
        
        return Promise.resolve()
        .then(()=>{
            
            if (ref_fMeta.structureFConfig.cardinality == "one") {
                if (Array.isArray(doc[nom_refCloneField])) {
                    throw new Error("la cardinalidad no concuerdan");
                }
                if (typeof doc[nom_refCloneField] != "string") {
                    return Promise.resolve(doc);
                }
                
                return ext_ctrl.getBy_pathDoc(doc[nom_refCloneField], hookParams)
                                .then((docClone:unknown) => {
                                    doc[nom_refCloneField] = docClone;
                                    return doc;
                                })
            }

            if(ref_fMeta.structureFConfig.cardinality == "many"){

                const nomRefs = Object.keys(doc[nom_refCloneField]);
                let pmsQ = nomRefs.filter((nRs) => {
                    /**filtrar solo los que son string que serian rutas _pathDoc */
                    const v = doc[nom_refCloneField][nRs];
                    const r =  typeof v == "string"; 
                    return r;
                }).map((_id_Or_idx) => {

                    const _pathDoc = doc[nom_refCloneField][_id_Or_idx];
                    
                    if ( !_pathDoc || _pathDoc == null
                        || typeof _pathDoc != "string") {
                            return Promise.resolve();
                    }

                    return ext_ctrl.getBy_pathDoc(_pathDoc, hookParams)
                    .then((docClone:unknown) => {
                        doc[nom_refCloneField][_id_Or_idx] = docClone;
                        return;
                    });                     

                });

                return Promise.all(pmsQ)
                            .then(()=>{return doc});

            }

            throw new Error("no tiene cardinalidad definida");
        });
    
    }

    /** 
     * *public*  
     * recorre todo el documento en busca de campos que 
     * almacenen referencias de tipo _docClone y de estos 
     * que contengan un string _pathDoc lo convierte a 
     * los documentos Clone correspondientes.  
     * 
     * *Param:*  
     * `doc` : documento a a analizar los campos de 
     * referencia _docClone.  
     * `hookParams` : parametros para el hook de lectura.  
     * `_pathBase` : ruta base del documento.  
     * 
     * ____
     */
    public populateDocClone(
        doc:TModel,
        hookParams?:IHookParams,
        _pathBase="",         
    ){

        let pmsQ:Promise<any>[] = [];

        for (const nomField in this.modelMeta) {

            const fMeta = <IFieldMeta<any, any>><unknown>this.modelMeta[nomField];

            /*Determinar sino son campos propiedad meta */
            if (typeof this.modelMeta[nomField] == 'function'  
                || nomField == "constructor" 
            ) {
                continue;
            }

            if(fMeta.structureFConfig
               && fMeta.structureFConfig != null
               && fMeta.structureFConfig.typeRef
               && fMeta.structureFConfig.typeRef == "_docClone"
            ){
                const nomRefField = fMeta.nom;
                pmsQ.push(
                    this.populateFieldClone(doc, nomRefField, hookParams, _pathBase)
                );
            }

        }
        return Promise.all(pmsQ)
        .then(()=>doc);
    }

    /** 
     * *public*  
     * cuando se desea modificar (ya sea actualizar o eliminar) 
     * un documento de esta coleccion que esta referenciado 
     * en otras colecciones, este metodo garantizará la integridad 
     * referencial de dichos cambios, en las otras colecciones.  
     * 
     * *Params:*  
     * `modType` : determina el tipo de modificacion a realizar
     * `_idOrigin_or_docOrigin` si el tipo de modificacion es 
     * "`update`" debe recibirse un **docuemento** que contenga
     * *_id* de referencia, si la modificacion es "`remove`" 
     * puede recibirse un *_id* o un documento que contenga 
     * dicho *_id*
     * ____
     */
    public modifyReference<TModel>(
        modType: "update" | "remove",
        _docOrigin:TModel | string,
        _pathBase?:string
    ):Promise<void>{

        /**Verificar que sea un documento con las 
         * propiedaddes necesarias para consultar */
        if (!_docOrigin || _docOrigin == null
            || !_docOrigin["_id"] || _docOrigin["_id"] == null
            || !_docOrigin["_pathDoc"] || _docOrigin["_pathDoc"] == null
        ) {
            throw new Error("No es un documento valido para rastrear" + _docOrigin);            
        }

        /*crear por cada ctrl asignado como referencia una 
        promesa de modificacion de clon referencia */
        const o_Ctrls = this.getOutputCtrls();
        const promisesForModifyByAllCtrls = o_Ctrls.map((getCtrl)=>{
            
            /*recoge las propiedades necesarias para analizar 
            el ctrl que se esta mapeando */
            let ext_Ctrl = getCtrl();
            let ext_MMeta = ext_Ctrl.getModelMeta();
    
            /*crea las promesas para remover las referencias _id de 
            cada documento de esta coleccion mapeada*/
            let promiseForModifyRefByCollection = Object.keys(ext_MMeta) //recorre por los nombres de los campos
                    /*filtra los campos que hagan referencia 
                    a este modelo*/
                    .filter((nomField)=>{
                        
                        const ext_fMeta = <IFieldMeta<unknown, any>>ext_MMeta[nomField];
                        
                        //Garantizar las propiedades necesarias 
                        //para ser un campo referencial       
                        const r = (ext_fMeta.structureFConfig
                            && ext_fMeta.structureFConfig != null
                            && ext_fMeta.structureFConfig.extModelMeta
                            && ext_fMeta.structureFConfig.extModelMeta != null

                            /**garantizar que el campo sea referencial */
                            && ext_fMeta.fieldType == EFieldType.foreign

                            /**si el campo es _pathDoc y el tipo de modificacion 
                             * es "update", no se requiere hacer consulta ya que 
                             * los _pathDoc NO se actualizan solo son existentes 
                             * o eliminados*/
                            && !(ext_fMeta.structureFConfig.typeRef == "_pathDoc"
                                 && modType == "update")

                        );
                        return r
                    })
                    /*ejecutar por cada campo (aunque normalmente 
                    será 1) la remocion de la referencia si existe*/
                    .map((nomRefField)=>{

                        const ext_fMeta = <IFieldMeta<unknown, any>>ext_MMeta[nomRefField];

                        /*Busca los documentos que tengan _id referencia */
                        return ext_Ctrl.getDocsByRefence(_docOrigin, nomRefField)
                        .then((doc_unkmow) => {

                            //realiza el cast en caso de recibir 1 solo documento
                            let docs = (Array.isArray(doc_unkmow)) ? doc_unkmow : [doc_unkmow];

                            /*crea una promesa por cada documento que contenga referencia _id*/
                            const promisesForRemoveRefInDoc = docs.map((doc) => {

                                doc = this.exec_modifyRef(doc, _docOrigin, nomRefField, ext_fMeta, modType);

                                /*Hook --opcional */
                                const hk = ext_Ctrl.getDefHookParamsInstance();

                                return ext_Ctrl.update(doc, hk, undefined, undefined);
                            });

                            return Promise.all(promisesForRemoveRefInDoc)
                            .then(()=>{return}); //elimina el problema de retornos de tipo void[]
                        });

                    });

            return Promise.all(promiseForModifyRefByCollection)
                    .then(()=>{return;}); //elimina el problema de retornos de tipo void[]

        });
        
        return Promise.all(promisesForModifyByAllCtrls)
               .then(()=>{return;}); //elimina el problema de retornos de tipo void[]
    }

    //================================================================================================================================  
    //

    /** 
     * *private*  
     * una vez obtenido el documento donde se encuentra 
     * la referencia, en este se procede a eliminar o 
     * actualizar los datos de dicha referencia
     * *Param:*  
     * `doc` : el documento externo donde esta la referencia.  
     * `_docOrigin` : el documento original con la modificacion a propagar.  
     * `nomRefField` : el nombre del campo que almacena la referencia.  
     * `ref_fMeta` : la metadata del campo que contiene la referencia.  
     * `modType` : el tipo de modificacion.  
     * ____
     */
    private exec_modifyRef(
        doc:any,
        _docOrigin:any,
        nomRefField:string,
        ext_fMeta:IFieldMeta<unknown, any>,
        modType: "update" | "remove"
    ){  

        switch (ext_fMeta.structureFConfig.typeRef) {

            case "_pathDoc":
                if (ext_fMeta.structureFConfig.cardinality == "one") {
                    if (doc[nomRefField] === _docOrigin["_id"] ||
                        doc[nomRefField] === _docOrigin["_pathDoc"]
                    ) {
                        // if (modType  == "update") {
                        //     //las referencias _pathDoc no estan sujetas a actualizacion                            
                        // }
                        if (modType  == "remove") {
                            doc[nomRefField] = null;
                        }                        
                            
                    }                                                
                } else if (ext_fMeta.structureFConfig.cardinality == "many") {
                    const idx = (<string[]>doc[nomRefField]).findIndex((_id_or_path)=>{
                        return (_id_or_path === _docOrigin["_id"]) ||
                               (_id_or_path === _docOrigin["_pathDoc"]);
                    });
                    if (idx >= 0) {   
                                             
                        // if (modType  == "update") {
                        //     //las referencias _pathDoc no estan sujetas a actualizacion       
                        // }
                        if (modType  == "remove") {
                            (<string[]>doc[nomRefField]).splice(idx, 1);  
                        }    
                    }                                                
                } else {
                    throw new Error("no hay cardinalidad");
                }
                break;

            case "_docClone":
                if (ext_fMeta.structureFConfig.cardinality == "one") {
                    if (doc[nomRefField]["_pathDoc"] 
                        && doc[nomRefField]["_pathDoc"] != null
                        && doc[nomRefField]["_pathDoc"] === _docOrigin["_pathDoc"]
                    ) {
                        if (modType == "update") {
                            doc[nomRefField] = _docOrigin;
                        }
                        if (modType == "remove") {
                            doc[nomRefField] = {};
                        }
                    }
 
                } else if (ext_fMeta.structureFConfig.cardinality == "many") {

                    if (!ext_fMeta.isArray) {
                        if (doc[nomRefField][`${_docOrigin["_id"]}`] &&
                            doc[nomRefField][`${_docOrigin["_id"]}`] != null
                        ) {

                            if (modType  == "update") {
                                doc[nomRefField][`${_docOrigin["_id"]}`] = _docOrigin;                       
                            }
                            if (modType  == "remove") {
                                delete doc[nomRefField][`${_docOrigin["_id"]}`]; //elimina la propiedad directamente
                            }  
                            
                        }
                    } else {
                        /**normalmente en cardinalidad many NO debe ejecutarse con isArray
                         * pero se deja el soporte si mas adelante firestore permite consultar 
                         * arrays de objetos
                        */                        
                        const idx = (<string[]>doc[nomRefField]).findIndex((_id_or_path)=>{
                            return (_id_or_path["_id"] === _docOrigin["_id"]) ||
                                   (_id_or_path["_pathDoc"] === _docOrigin["_pathDoc"]);
                        });
                        if (idx >= 0) {
                            
                            if (modType  == "update") {
                                doc[nomRefField][idx] = _docOrigin;                          
                            }
                            if (modType  == "remove") {
                                doc[nomRefField].splice(idx, 1);
                            }  
                              
                        }  
                    }                                  
                } else {
                    throw new Error("no hay cardinalidad");
                }    
                break;                                            
    
            default:
                break;
        } 
        
        return doc;
    }

    /** 
     * *public*  
     * descrip...
     * ____
     */
    public updateModelMetada(modelMeta:TModelMeta){
        this.modelMeta = modelMeta;
    }

    /** 
     * *private*  
     * determina si es un modelmeta externo o es 
     * autorecursivo por medio de "this"
     * ____
     */
    private getExtModelMeta(extMMeta:unknown){
        const r = (extMMeta === "this") ?
                this.modelMeta : (extMMeta);
        return r as ModelMetadata
    }
    

    /** 
     * *public*  
     * devuelve el controlador asociado al modelo 
     * externo que reciba
     * ____
     */
    public getInputCtrlByNomModel(nomModel:string){
        const fnCtrl = this.getInputCtrls().get(nomModel);
        if (!fnCtrl || fnCtrl == null) {
            throw new Error("no existe Controller asociado a este modelo");            
        }   
        return fnCtrl();     
    }

    /** 
     * *public*  
     * retorna la instancia actual del paginator
     * ____
     */
    public getPopulatePaginator():Fb_Paginator{      
        return this.populatePaginator;
    }

}
