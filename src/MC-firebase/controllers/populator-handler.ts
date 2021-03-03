import { Fb_Controller } from "./fb-controller";
import { IPopulationFilter } from "./filter-handler";
import { IFieldMeta, EFieldType, ModelMetadata } from "./meta";
import { Fb_Paginator } from "./fb-paginator";
import { IHookParams } from "./hook-handler";
import { Model } from "../models/model";


//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *abstract class*  
 * descrip... 
 * ____
 * *Types:*  
 * `TModel` : tipado del modelo.
 * `TModelMeta` : tipado de la metadata  
 * ____
 */
export abstract class PopulatorHandler<TModel, TModelMeta>{

    /** *protected*  
     * mapa que almacena cada controller de cada campo que 
     * puede ser poblado, se accede a cada elemento por medio 
     * del *nom*  del campo
     * ____
     */
    protected inputCtrlsByField:Map<string, ()=>Fb_Controller<unknown,unknown,unknown>>;

    /** *protected*  
     * descrip...
     * ____
     */
    protected outputCtrls:[()=>Fb_Controller<unknown,unknown,unknown>];
    
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
    
    /** 
     * `constructor()`  
     * descrip...
     * ____
     */
    constructor() {}

    //================================================================================================================================  
    //REFERNETE A POPULATOR

    /** 
     * *protected abstract*  
     * 
     * ____
     */
    protected abstract initInputCtrls():void;
    
    /** 
     * *protected abstract*  
     * 
     * ____
     */
    protected abstract initOutputCtrls():void;    

    /** 
     * *private*  
     * ....
     * 
     * *Param:*  
     * `_pathDocsOr_ids` : array con las referencias en 
     * string a paginar (pueden ser _pathDocs o _ids).  
     * `fieldMeta` : la metadata del campo a poblar.  
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
        fieldMeta:IFieldMeta<TField,any>, 
        populatorFilter:IPopulationFilter<unknown>,        
        hookParams?:IHookParams,
        _pathBase = "",
    ):Promise<TModel[]>{

        if (populatorFilter.isPopulate == false) {
            /*Debe devolver un vacio ya que no se puede poblar*/
            return Promise.resolve([]);
        }
        
        if (fieldMeta.fieldType != EFieldType.foreignKey) {
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

        let modelCtrl = this.getInputCtrlByNomField(fieldMeta.nom);
        let paginator = modelCtrl.getModelPopulator().getPopulatePaginator();

        /*si se pagína almacena una parte de
        toda la lista de _pathDocs o todo el 
        listado si no se pagína
        */
        let extract_pathDocs = paginator.configParamsPopulateForPaginate(_pathDocsOr_ids, populatorFilter);        
        let populationPromises = extract_pathDocs.map((_pathDocOr_id)=>{
            
            if (fieldMeta.structureFConfig.typeRef == "_id") {
                return modelCtrl.getBy_id(_pathDocOr_id, hookParams, _pathBase);
            }

            if (fieldMeta.structureFConfig.typeRef == "_pathDoc") {
                return modelCtrl.getBy_pathDoc(_pathDocOr_id, hookParams);
            }
            /**retorna la referencia sin
             *  alterar (en tipo string) */
            return Promise.resolve(_pathDocOr_id)     
                     
        });

        return Promise.all(populationPromises)
        .then((docs)=>{

            /**post paginar y Actualizar el elemento del mapa */
            docs = paginator.postPopulationPaginate(docs, populatorFilter);

            return docs as TModel[];
        });
    }    

    /** 
     * *public*  
     * descrip...
     * 
     * *Param:*  
     * `pm1`  
     * ____
     */
    public setCloneReference(
        doc:TModel,
        nom_Ref_Field:string,
        hookParams?:IHookParams,
        _pathBase="",      
    ):Promise<TModel>{
                
        /*comprobacion que existe el _id referencial en 
        la instancia del modelo a analizar*/
        if(!doc
            || doc == null            
            || !doc[nom_Ref_Field] 
            || doc[nom_Ref_Field] == null
            || (Array.isArray(doc[nom_Ref_Field])  
                && (<unknown[]>doc[nom_Ref_Field]).length == 0)
        ){
            return Promise.resolve(doc);
        }

        const mMeta = <ModelMetadata><unknown>this.modelMeta;
        const ref_fMeta = <IFieldMeta<unknown, any>>mMeta[nom_Ref_Field];

        /*comprobacion de propiedades de metadata para el 
        campo que almacena _id de referencia*/
        if (!ref_fMeta.structureFConfig  
            || ref_fMeta.structureFConfig == null 
            || !ref_fMeta.structureFConfig.extModelMeta  
            || ref_fMeta.structureFConfig.extModelMeta == null 
            || !ref_fMeta.structureFConfig.typeRef  
            || ref_fMeta.structureFConfig.typeRef == null 
            || !ref_fMeta.structureFConfig.nomRefFieldLinked  
            || ref_fMeta.structureFConfig.nomRefFieldLinked == null 
        ) {
            return Promise.resolve(doc);
        }

        const nom_RefClone_Field = ref_fMeta.structureFConfig.nomRefFieldLinked;
        const refClone_fMeta = <IFieldMeta<unknown, any>>mMeta[nom_RefClone_Field];

        /*comprobacion de propiedades de metadata para el 
        campo que almacena _docClone de referencia*/
        if (!refClone_fMeta  
            || refClone_fMeta == null 
            || !refClone_fMeta.structureFConfig  
            || refClone_fMeta.structureFConfig == null 
            || !refClone_fMeta.structureFConfig.extModelMeta  
            || refClone_fMeta.structureFConfig.extModelMeta == null
        ) {
            return Promise.resolve(doc);
        }

        const ext_ctrl = this.getInputCtrlByNomField(nom_Ref_Field);
      
        return Promise.resolve()
        .then(()=>{

            /*determina cardinalidad actual del campo referencial */
            if (Array.isArray(doc[nom_Ref_Field])) {

                /*temporales para compara las referencias entre 
                la referencias y los clones referenciales*/
                const refs:any[] = doc[nom_Ref_Field];
                const refs_clone:any[] = (doc[nom_RefClone_Field] && 
                                    doc[nom_RefClone_Field] != null &&
                                    Array.isArray(doc[nom_RefClone_Field])) ? 
                                    doc[nom_RefClone_Field] : [];

                /*Contendrá la diferencia
                entre los arrays refs y refs_clone */
                let refs_missing:any[];

                /*promseas a ejecutar para igualara los 
                arrays refs y refs_clone*/
                let promises_ref:Promise<unknown>[];

                if (ref_fMeta.structureFConfig.typeRef == "_id") {
                    
                    /*extrae la diferencia por propiedad _id */
                    refs_missing = refs.filter((ref)=>{
                        const r = refs_clone.some((dClone)=>{
                            return dClone["_id"] === ref;
                        })
                        return !r;
                    });

                    /*asigna las promesas necesarias para igualar*/
                    promises_ref = refs_missing .map((ref:string)=>{
                        return ext_ctrl.getBy_id(ref, hookParams, _pathBase)
                    });

                }

                if (ref_fMeta.structureFConfig.typeRef == "_pathDoc") {

                    /*extrae la diferencia por propiedad _pathDoc */
                    refs_missing = refs.filter((ref)=>{
                        const r = refs_clone.some((dClone)=>{
                            return dClone["_pathDoc"] === ref;
                        })
                        return !r;
                    });
                    
                    /*asigna las promesas necesarias para igualar*/
                    promises_ref = refs_missing .map((ref:string)=>{
                        return ext_ctrl.getBy_pathDoc(ref, hookParams)
                    });                    
                }

                /*ejecuta las promesas en conjunto para completar el doc */
                return Promise.all(promises_ref)
                .then((docsClone)=>{
                    let rdc:any[] = (Array.isArray(doc[nom_RefClone_Field])) ? 
                                    doc[nom_RefClone_Field] : 
                                    [];//-- toca analizar si se desea [doc[nom_RefClone_Field]]
                    
                    doc[nom_RefClone_Field] = rdc.concat(docsClone);
                    return doc;
                });

            }else{
                /*para el caso de cardinalidad 0a1 o 1a1 
                solo se requiere una promesa*/
                let promise_ref: Promise<unknown>; 

                if (ref_fMeta.structureFConfig.typeRef == "_id") {
                    promise_ref = ext_ctrl.getBy_id(doc[nom_Ref_Field], hookParams, _pathBase);
                }

                if (ref_fMeta.structureFConfig.typeRef == "_pathDoc") {
                    promise_ref = ext_ctrl.getBy_pathDoc(doc[nom_Ref_Field], hookParams);
                }

                /*ejecuta la promesa y completa el doc con 
                el valor recibido */
                return promise_ref
                .then((fc_doc)=>{
                    doc[nom_RefClone_Field] = (fc_doc) ? 
                                                fc_doc : null;
                    return doc;
                });
            }
        });        
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
    public modifyReference<ref_TModel>(
        modType: "update" | "remove",
        _idOrigin_or_docOrigin:ref_TModel | string,
    ):Promise<void>{

        /*contiene el objeto modelo referencial, que 
        se adaptara deacuerdo a los parametros 
        recibidos para que dentro de este metodo sea 
        usado como objeto referencia*/ 
        let _docOrigin = {};

        /*configurar el _docOrigin de acuerdo al tipo 
        de modificacion de la referencia*/

        if ( modType == "update") {
            if (typeof _idOrigin_or_docOrigin != "object" ||
                !_idOrigin_or_docOrigin || _idOrigin_or_docOrigin == null ||
                !_idOrigin_or_docOrigin["_id"] || _idOrigin_or_docOrigin["_id"] == null 

                //si se implementa en algun momento busqueda por _pathDoc
                // || !_reference["_pathDoc"] || _reference["_pathDoc"] == null
            ) {
                //no tiene las propiedades ncecesarias para bucar la referencia
                return Promise.resolve();
            }
            //asigne el objeto directamente
            _docOrigin = _idOrigin_or_docOrigin;
        }

        if (modType == "remove") {

            /*Verificar si es una referencia en _id string abuscar 
            o si es un objeto que contenga la propiedad _id 
            a buscar*/
            if (
                (typeof _idOrigin_or_docOrigin == "string" 
                    && _idOrigin_or_docOrigin != "")

                ||

                (typeof _idOrigin_or_docOrigin == "object"  
                    && _idOrigin_or_docOrigin != null 
                    && _idOrigin_or_docOrigin["_id"]  
                    && _idOrigin_or_docOrigin["_id"] != null )
            ) {
                if (typeof _idOrigin_or_docOrigin == "string") {
                    //instancia el objeto y asigna la propidad _id recibida            
                    _docOrigin = {};
                    _docOrigin["_id"] = <string>_idOrigin_or_docOrigin;                    
                }

                if (typeof _idOrigin_or_docOrigin == "object") {
                    _docOrigin = _idOrigin_or_docOrigin;
                }
            }else{
                /*no tiene un _id asignado para buscar referencia 
                o no es un objeto que contenga el _id de referencia */
                return Promise.resolve();
            }

        }

        /*crear por cada ctrl asignado como referencia una 
        promesa de modificacion de clon referencia */
        const promisesForModifyByAllCtrls = this.outputCtrls.map((getCtrl)=>{
            
            /*recoge las propiedades necesarias para analizar 
            el ctrl que se esta mapeando */
            let ref_ctrl = getCtrl();
            let ref_mMeta = ref_ctrl.getModelMeta();
    
            /*crea las promesas para remover las referencias _id de 
            cada documento de esta coleccion mapeada*/
            let promiseForModifyRefByCollection = Object.keys(ref_mMeta) //recorre por los nombres de los campos
                    /*filtra los campos que hagan referencia 
                    a este modelo*/
                    .filter((nomField)=>{
                        
                        const ref_fMeta = <IFieldMeta<unknown, any>>ref_mMeta[nomField];
                        
                        //Garantizar las propiedades necesarias 
                        //para ser un campo referencial
                        if (!ref_fMeta.structureFConfig || 
                            ref_fMeta.structureFConfig == null ||
                            !ref_fMeta.structureFConfig.extModelMeta || 
                            ref_fMeta.structureFConfig.extModelMeta == null
                        ) {
                            return false;
                        }

                        const ext_MMeta = <ModelMetadata>ref_fMeta.structureFConfig.extModelMeta;
                        
                        return (
                                    //verificacion de tipo de campo que sea referencial
                                    (
                                        ref_fMeta.fieldType == EFieldType.foreignKey //||
                                        //para Firestore es conveniente garantizar solo fk_ 
                                        //ref_fMeta.fieldType == EFieldType.foreignClone 
                                    ) &&
                                    
                                    /*Verificacion de coincidencia de referencia 
                                    (por medio del nombre de coleecion)*/
                                    (
                                        <string><unknown>ext_MMeta === "this" || //si es recursivo
                                        ext_MMeta.__nomColeccion == (<ModelMetadata><unknown>this.modelMeta).__nomColeccion
                                    )
                                )
                    })
                    /*ejecutar por cada campo (aunque normalmente 
                    será 1) la remocion del la referencia si existe*/
                    .map((nomField)=>{

                        const ref_fMeta = <IFieldMeta<unknown, any>>ref_mMeta[nomField];
                        const lnk_nomField = ref_fMeta.structureFConfig.nomRefFieldLinked;

                        /*Busca los documentos que tengan _id referencia */
                        return ref_ctrl.getDocsByRefence(_docOrigin["_id"], nomField)
                        .then((doc_unkmow) => {

                            //realiza el cast en caso de recibir 1 solo documento
                            let docs = (Array.isArray(doc_unkmow)) ? doc_unkmow : [doc_unkmow];

                            /*crea una promesa por cada documento que contenga referencia _id*/
                            const promisesForRemoveRefInDoc = docs.map((doc) => {

                                /*Hook --opcional */
                                const hk = ref_ctrl.getDefHookParamsInstance();

                                /*Contenedores de index si es encontrado el _id o 
                                _docClone referencial.
                                Tener en cuenta: el index del _id NO necesariamente 
                                es el mismo del index del _docClone, esto se debe a 
                                que Firestore almcaena los valores de los campos array 
                                de forma aleatoria por lo tanto es necesario extraer 
                                cada index y alamcenarlo aparte*/
                                let idx_id_Finded = this.checkRefernce(_docOrigin["_id"], doc[nomField]);
                                let idx_clone_Finded = this.checkRefernce(_docOrigin["_id"], doc[lnk_nomField]);

                                if (idx_id_Finded < 0 || idx_id_Finded == null) {
                                    return Promise.resolve(); 
                                }

                                /*Actualizacion de referencia */
                                if (modType == "update") {
                                    /*En la actualizacion se garantiza que los 
                                    cambios realizados del _docOrigin sean 
                                    almacenados */

                                    if (Array.isArray(doc[lnk_nomField])) {
                                        
                                        /*si el array contiene el un _docClone con 
                                        el _id de referencia lo catualiza en el 
                                        index que corresponda, de lo contrario lo 
                                        asigna como un nuevo item en la ultima posicion*/
                                        if (idx_clone_Finded >= 0) {
                                            doc[lnk_nomField][idx_clone_Finded] = _docOrigin;
                                        } else {
                                           let d = (<unknown[]>doc[lnk_nomField]);
                                           d.push(_docOrigin);
                                        }
                                        
                                    }else{
                                        /*Actualiza el _docClone que tenga almacenado */
                                        doc[lnk_nomField] = _docOrigin;
                                    }
                                }
                                
                                /*Remover referencia */
                                if (modType == "remove") {

                                    if (Array.isArray(doc[nomField])) {
                                        (<string[]>doc[nomField]).splice(idx_id_Finded, 1);
                                    }else{
                                        doc[nomField] = null;
                                    }

                                    if (idx_clone_Finded >= 0) {
                                        if (Array.isArray(doc[lnk_nomField])) {
                                            (<string[]>doc[lnk_nomField]).splice(idx_id_Finded, 1);
                                        }else{
                                            doc[lnk_nomField] = {};
                                        }
                                    }                                    
                                }

                                return ref_ctrl.update(doc, hk, undefined, undefined);
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
     * permite verificar si una referencia (sea *_id* 
     * o *_docClone*) esta almacenada en el campo a 
     * analizar y retorna el numero del index de la 
     * posicion en la que esta almacenado dicha referencia.  
     * Ya que el campo puede alamcenar sencillo o array, 
     * esto influye en el tipo en el retorno, si el campo 
     * a analizar es array devuelve el numero de *index* 
     * si encontró la referencia o *-1* si no la encontró, 
     * si el campo NO es array devuelve *1* si lo encontró 
     * y *null* si no lo encontró
     * 
     * *Param:*  
     * `_idOrigin` : el _id a buscar, ya sea que el campo 
     * almacene solo *_id* o un *_docClone*.
     * `ref_Field` : el campo que contiene las referencia 
     * a analizar
     * ____
     */
    private checkRefernce<TRef_Field>(
        _idOrigin:string,
        ref_Field:TRef_Field | TRef_Field[]
    ):number | null{

        //garantizar que el campo existe
        if (!ref_Field || ref_Field == null) {
            return null;
        }

        if (Array.isArray(ref_Field)) {
            
            //busca el _idOrigin en el array 
            return ref_Field.findIndex((ref) => {
                //se verifica si el campo almacena _id
                if (typeof ref == "string" ) {
                    return ref === _idOrigin;
                }
                //se verifica si el campo almacena _docClone
                if (typeof ref == "object" ) {
                    return (ref["_id"]) ? 
                            ref["_id"] === _idOrigin : 
                            false;                    
                }
                return false;                
            });

        }else{

            //busca el _id si el campo almacena unicamente _id
            if (typeof ref_Field == "string" &&
                ref_Field === _idOrigin 
            ) {
                return 1;
            }

            //busca el _id si el campo almacena _docClone
            if (typeof ref_Field == "object" &&
                ref_Field["_id"] &&
                ref_Field["_id"] === _idOrigin 
            ) {
                return 1                 
            }
            return null;  
        }
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
     * *public*  
     * devuelve el controlador asociado al campo 
     * (nombre del campo) que se reciba
     * ____
     */
    public getInputCtrlByNomField(nomField:string){
        const fnCtrl = this.inputCtrlsByField.get(nomField);
        if (!fnCtrl || fnCtrl == null) {
            throw new Error("no existe Controller asociado a este campo");            
        }   
        return fnCtrl();     
    }

    /** 
     * *public*  
     * descrip...
     * ____
     */
    public getPopulatePaginator():Fb_Paginator{      
        return this.populatePaginator;
    }

}
