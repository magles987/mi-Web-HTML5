import { UtilControllers } from "./util-ctrl";
import { Formatter } from "./formatter";
import { ModelMetadata } from "./meta";
import { IFilter, IPopulationFilter } from "./filter-handler";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *interface*  
 * 
 * ____
 */
export interface IHookParams {
    //================================   
    //para pre lectura:

    //================================   
    //para post lectura:    

    //================================   
    //para pre Modificacion (crear, actualizar, eliminar):

    //================================   
    /**Contenedor de HookParams externos 
     * el cual debe ser sobre escrito en la 
     * interfaz que hereda a esta y correspondiente 
     * al modeloHookParam
    */
   ext_HookParams?:unknown;
    //================================   
    //para post Modificacion (crear, actualizar, eliminar):

}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class* `Hooks` 
 * factoriza y declara los metodos hooks.
 *  
 * Los hooks son metodos que se ejecutan antes (con 
 * prefijo *pre*) y despues (con prefijo *post*) 
 * de los metodos CRUD, usados principalmente para
 *  depuracion y formateo de los documentos antes 
 * de ser entregados al componente (en el caso de 
 * las lecturas) o antes de modificarlos en la base
 * de datos (en el caso de creacuin actualizacion o
 * eliminacion )
 * 
 * ____
 * *Types:*  
 * `TModel` : representa el Modelo (class) de la 
 * coleccion almacenada en Firestore 
 * ____
 */
export abstract class HookHandler<TModel, TModelMeta>{
    
    /** *protected abstract*  
     * contiene la configuracion inicial 
     * predefinida para el hook.  
     * **Importante:** es necesario inicializar 
     * esta propiedad en las clases que heredan
     * ____
     */
    protected abstract defaultModelHookParams:IHookParams;

    /**Intancia que accedde a metodos para 
     * formateo de documentos */
    protected formatter:Formatter;

    /**instancia con Utilidades para el controller*/
    protected utilCtrl:UtilControllers;

    /** 
     * `constructor()`  
     * inicializa las propiedades por default 
     * de *modelHookParams* e inicializa demas 
     * instancias de utilidades
     * ____
     */
    constructor(){
        this.utilCtrl = UtilControllers.getInstance();
    }

    /** 
     * *abstract public*  
     * retorna una instancia de configuracion del 
     * hook a modo de plantilla para modificar de 
     * acuerdo a las necesidades
     * ____
     */
    public abstract getHookParamsPrototype():IHookParams;   
    
    /** 
     * *protected*  
     * Inicializa las propiedades factorizadas por 
     * default, devuelve un *Extracto* del objeto 
     * *defaultModelHookParams*
     * ____
     */
    protected startDefault():IHookParams{
        return {

            ext_HookParams:{}
        }
    }

    /** 
     * *protected*  
     * factorizacion interna para los metodos hook 
     * referentes a pre-modificacion (preCreate, 
     * preUpdate, preDelete).  
     * 
     * Dependiendo del *typeMod* recibido, 
     * retorna el documento ya formateado o el 
     * string del _id del documento a eliminar  
     * 
     * *Param:*  
     * `typeMod` : indica el tipo de modificacion a realizar.  
     * `dataMod` : objeto contenedor de datos como el documento 
     * a modificar o en su defecto la _id si lo que se quiere 
     * es eliminar.  
     * `metadata` : la metadata del modelo.  
     * `hookParams` : parametros de configuracion para los 
     * metodos hooks.  
     * ____
     */
    protected commonPreMod(
        typeMod:"create" | "update" | "delete", 
        dataMod:{doc?:TModel, _id?:string },
        modelMeta:TModelMeta, 
        hookParams:IHookParams
    ):Promise<TModel | string>{
        if (!dataMod || dataMod == null) {
            throw new Error("No se recibio el parametro dataMod");  
        }
        
        switch (typeMod) {
            case "create":
                if (!dataMod.doc) {
                    throw new Error("No se recibio el parametro dataMod completo");  
                }
                //..aqui lo comun
                return Promise.resolve(dataMod.doc);
                break

            case "update":
                if (!dataMod.doc) {
                    throw new Error("No se recibio el parametro dataMod completo");
                }
                //..aqui lo comun
                return Promise.resolve(dataMod.doc);
                break;                
        
            case "delete":
                if (!dataMod._id) {
                    throw new Error("No se recibio el parametro dataMod completo");
                }
                //..aqui lo comun
                return Promise.resolve(dataMod._id);
                break;                   
            default:
                return Promise.resolve(dataMod.doc);
                break;
        }
    }

    /** 
     * *public*  
     * **Recordar:** tiene una funcionalidad predefinida, 
     * para usarlo personalizado es necesario usar sobreescritura 
     * en el hook del modelo correspondiente.
     *  
     * se deberá ejecutar antes de enviar la solicitud 
     * de lectura a Firestore.
     * 
     * Devuelve una promesa indicando la ejecucion del 
     * hook y el estado del mismo 
     * 
     * *Param:*  
     * `hookParams` : Contiene informacion adicional  
     * para configurar los diferentes tipos de hooks, este 
     * objeto debe ser tipado en la implementacion de 
     * acuerdo al modelHookParams correspondiente.
     * `filter` : 
     * ____
     */
    public preGet(
        hookParams:IHookParams, 
        filter?:IFilter<unknown>
    ):Promise<void>{
        //..aqui lo que se necesite del hook
        return Promise.resolve();
    }

    /** 
     * *public*  
     * **Recordar:** tiene una funcionalidad predefinida, 
     * para usarlo personalizado es necesario usar sobreescritura 
     * en el hook del modelo correspondiente.
     *   
     * se debe ejecutar despues de la lectura para procesar 
     * y enriquecer los docs recibidos de Firestore.  
     * *Recordar* este metodo Hook no devuelve una promesa para 
     * agregarle compatibilidad a librerias como RxJS si se van 
     * a usar observables aunque esto puede cambiar en algun 
     * momento  
     * 
     * *Param:*  
     * `docs` : documentos leidos por Firestore (puede ser 
     * uno o varios dependiendo de la consulta)  
     * `hookParams` : Contiene informacion adicional  
     * para configurar los diferentes tipos de hooks, este 
     * objeto debe ser tipado en la implementacion de 
     * acuerdo al modelHookParams correspondiente
     */
    public postGet(
        docs:TModel | TModel[], 
        hookParams:IHookParams, 
        filter?:IFilter<unknown>
    ):Promise<TModel | TModel[]>{
        return Promise.resolve(docs);
    }    

    /** 
     * *public*  
     * **Recordar:** tiene una funcionalidad predefinida, 
     * para usarlo personalizado es necesario usar sobreescritura 
     * en el hook del modelo correspondiente.
     *   
     * se debe ejecutar despues de la lectura para procesar 
     * y enriquecer los docs recibidos de Firestore.  
     * *Recordar* este metodo Hook no devuelve una promesa para 
     * agregarle compatibilidad a librerias como RxJS si se van 
     * a usar observables aunque esto puede cambiar en algun 
     * momento  
     * 
     * *Param:*  
     * `docs` : documentos leidos por Firestore (puede ser 
     * uno o varios dependiendo de la consulta)  
     * `hookParams` : Contiene informacion adicional  
     * para configurar los diferentes tipos de hooks, este 
     * objeto debe ser tipado en la implementacion de 
     * acuerdo al modelHookParams correspondiente
     * ____
     */
    public postGetWithOutPromise(
        docs:TModel | TModel[], 
        hookParams:IHookParams,
        filter?:IFilter<unknown>
    ):TModel | TModel[]{
        return docs;
    }

    /** 
     * *public*  
     *  
     * se deberá ejecutar antes de solicitar la creacion 
     * del documento en Firestore, podra formatear y 
     * modificar el documento antes de crearlo (eliminando
     * campos no almacenables y formateo general de datos).  
     * Devuelve una Promesa con el documento ya modificado 
     * y formateado listo para guardar   
     * 
     * *Param:*  
     * `doc` : documento a crear  
     * `hookParams` : Contiene informacion adicional  
     * para configurar los diferentes tipos de hooks, este 
     * objeto debe ser tipado en la implementacion de 
     * acuerdo al modelHookParams correspondiente
     * ____
     */
    public preCreate(
        doc:TModel, 
        modelMeta:TModelMeta, 
        hookParams:IHookParams
    ):Promise<TModel>{
        //...aqui lo que lo comun del hook
        return Promise.resolve(doc);
    }    
    
    /** 
     * *public*  
     * 
     * se deberá ejecutar despues de solicitar la creacion 
     * del documento en Firestore, se puede usar para realizar 
     * acciones adicionales una vez se haya confirmado que el 
     * documento fue creado.  
     * Devuelve una Promesa void confirmando que se realizó la 
     * creacion correctamente
     * 
     * *Param:*  
     * `doc` : documento ya creado  
     * `hookParams` : Contiene informacion adicional  
     * para configurar los diferentes tipos de hooks, este 
     * objeto debe ser tipado en la implementacion de 
     * acuerdo al modelHookParams correspondiente
     * ____
     */
    public postCreate(
        doc:TModel, 
        hookParams:IHookParams
    ):Promise<void>{
        //...aqui lo que lo comun del hook
        return Promise.resolve();
    }   

    /** 
     * *public*  
     *  
     * se deberá ejecutar antes de solicitar la actualizacion
     * del documento en Firestore, podra formatear y 
     * modificar el documento antes de actualizarlo (eliminando
     * campos no almacenables y formateo general de datos).  
     * Devuelve una Promesa con el documento ya modificado 
     * y formateado listo para guardar   
     * 
     * *Param:*  
     * `doc` : documento a actualizar 
     * `hookParams` : Contiene informacion adicional  
     * para configurar los diferentes tipos de hooks, este 
     * objeto debe ser tipado en la implementacion de 
     * acuerdo al modelHookParams correspondiente
     * ____
     */
    public preUpdate(
        doc:TModel, 
        modelMeta:TModelMeta, 
        hookParams:IHookParams
    ):Promise<TModel>{
        //...aqui lo que lo comun del hook
        return Promise.resolve(doc)
    }    
    
    /** 
     * *public*  
     *  
     * se deberá ejecutar despues de solicitar la actualizacion 
     * del documento en Firestore, se puede usar para realizar 
     * acciones adicionales una vez se haya confirmado que el 
     * documento fue actualizado.  
     * Devuelve una Promesa void confirmando que se realizó la 
     * actualizacion correctamente
     * 
     * *Param:*  
     * `doc` : documento ya actualizado  
     * `hookParams` : Contiene informacion adicional  
     * para configurar los diferentes tipos de hooks, este 
     * objeto debe ser tipado en la implementacion de 
     * acuerdo al modelHookParams correspondiente
     * ____
     */
    public postUpdate(
        doc:TModel, 
        hookParams:IHookParams
    ):Promise<void>{
        //...aqui lo que lo comun del hook
        return Promise.resolve();
    }  

    /** 
     * *public*  
     * 
     * se deberá ejecutar antes de solicitar la eliminacion
     * del documento en Firestore, podra formatear y 
     * modificar el documento antes de eliminarlo (eliminando
     * campos no almacenables y formateo general de datos).  
     * Devuelve una Promesa con el _id del documento listo a eliminar  
     * 
     * *Param:*  
     * `deletedDoc` : el documento que esta siendo sujeto de eliminacion
     * `hookParams` : Contiene informacion adicional  
     * para configurar los diferentes tipos de hooks, este 
     * objeto debe ser tipado en la implementacion de 
     * acuerdo al modelHookParams correspondiente
     * ____
     */
    public preDelete(
        deletedDoc:TModel, 
        modelMeta:TModelMeta, 
        hookParams:IHookParams
    ):Promise<TModel>{
        //...aqui lo que lo comun del hook
        return Promise.resolve(deletedDoc);
    }   
    
    /** 
     * *public*  
     *   
     * se deberá ejecutar despues de solicitar la eliminacion 
     * del documento en Firestore, se puede usar para realizar 
     * acciones adicionales una vez se haya confirmado que el 
     * documento fue eliminado.  
     * Devuelve una Promesa void confirmando que se realizó la 
     * eliminacion correctamente
     * 
     * *Param:*  
     * `deletedDoc` : el documento ya ha sido eliminado
     * `hookParams` : Contiene informacion adicional  
     * para configurar los diferentes tipos de hooks, este 
     * objeto debe ser tipado en la implementacion de 
     * acuerdo al modelHookParams correspondiente
     * ____
     */
    public postDelete(
        deletedDoc:TModel, 
        hookParams:IHookParams
    ):Promise<void>{
        //...aqui lo que lo comun del hook
        return Promise.resolve();
    }

    //================================================================
    //Utilitarios

}

