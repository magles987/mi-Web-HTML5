import { FirebaseConfig } from "../../../ts/firebase-config/firebase-config";
import { Fb_Controller } from "../fb-controller";

import { Usuario, IUsuario } from "../../models/usuario/usuario-m";
import { UsuarioMeta } from "./usuario-meta";
import { UsuarioFormatter } from "./usuario-formatter";

import { UsuarioHookHandler, IUsuarioHookParams } from "./usuario-hook-handler";
import { UsuarioFilterHandlerCtrl, IUsuarioFilter, IUsuarioPopulationFilter } from "./usuario-filter-handler";
import { Fb_Paginator } from "../fb-paginator";
import { UsuarioPopulator } from "./usuario-populator-handler";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class singleton*
 * Controller para este Modelo
 * ____
 * *extends:*  
 * `Fb_Controller`  
 * ____
 */
export class UsuarioController extends Fb_Controller<Usuario, IUsuario<any>, UsuarioMeta>{

    /** *private static*   
     * Almacena la instancia única de esta clase
     * ____
     */
    private static instance:UsuarioController;

    /** 
     * `constructor()`  
     * 
     * ____
     */
    constructor(){
        super();
        //configurar los metadatos tanto el offline como el de cloudFn
        this.modelMeta_Offline = new UsuarioMeta();
        this.updateModelMetada().catch((error)=>{ console.log(error)});
        
        this.paginator = new Fb_Paginator("AccumulativeStrong");
        this.populator = new UsuarioPopulator(this.modelMeta_Offline, 
                                new Fb_Paginator("AccumulativeSimple"));
        this.modelFormatter = new UsuarioFormatter();
        //this.modelValidator = new UsuarioValidator();

        this.modelFilterHandler = new UsuarioFilterHandlerCtrl();
        this.modelHookHandler = new UsuarioHookHandler();

    }

    /** *public static*  
     * devuelve la instancia única de esta clase  
     * ya sea que la crea o la qu eya a sido creada
     * ____
     */
    public static getInstance():UsuarioController{
        UsuarioController.instance = (!UsuarioController.instance || UsuarioController.instance == null) ?
                    new UsuarioController() : UsuarioController.instance;
        return UsuarioController.instance;
    }    

    /** 
     * *public*  
     * Lee todos los documentos de la coleccion 
     * 
     * *Param:*  
     * `filter` : contiene las opciones de filtrado, 
     * organizacion y paginacion de la consulta.  
     *`hookParams` : Parametros para los metodos hooks 
     * (pre y post) a la ejecucion de la lectura.  
     * 
     * ____
     */
    public getAllDocs(
        filter:IUsuarioFilter, 
        hookParams?:IUsuarioHookParams
    ){
        
        //metadata a usar
        const mMeta = this.modelMeta || this.modelMeta_Offline;

        /**configuracion de filtro obligatoria para 
         * esta Query*/
        filter.isCollectionGroup = false;
        filter.order._id = "asc";

        //configuracion comun para el hookParams
        hookParams = (hookParams && hookParams != null) ? 
                     hookParams : this.getDefHookParamsInstance();

        //================================================================
        //Constructor de Query

        //declarar cursor de consulta
        let cursorQuery:firebase.firestore.Query<firebase.firestore.DocumentData>
        
        /**Determinar tipo de coleccion (normal o group) */
        cursorQuery = this.configTypeCollectionQuery(cursorQuery, filter);

        /**Construit condiciones para query */
        //..aqui
        
        /**Determinar orden  */
        cursorQuery = cursorQuery.orderBy(mMeta._id.nom, filter.order._id);
        
        /**Configurar limite y pagina */
        cursorQuery = this.configLimitAndPaginateQuery(cursorQuery, filter);

        //ejecutar la consulta en comun
        return this.execQuery(cursorQuery, filter, hookParams);
    }

    /** @override <hr>  
     * *public*  
     * configuracion personalizada para la creacion
     * ____
     */ 
    public create(
        newDoc:Usuario, 
        hookParams?:IUsuarioHookParams, 
        _pathBase="", 
        ext_id=null,
    ){
        //configuracion personalizada para el hookParams
        hookParams = (hookParams && hookParams != null) ? 
                     hookParams : this.getDefHookParamsInstance();

        return super.create(newDoc, hookParams, _pathBase, ext_id);
    }

    /** @override <hr> 
     * *public*  
     * configuracion personalizada para la actualizacion
     * ____
     */ 
    public update(
        updatedDoc:Usuario, 
        hookParams:IUsuarioHookParams,  
        _pathBase="", 
        isStrongUpdate=false,             
    ){
        //configuracion personalizada para el hookParams
        hookParams = (hookParams && hookParams != null) ? 
                     hookParams : this.getDefHookParamsInstance();

        return super.update(updatedDoc, hookParams, _pathBase, isStrongUpdate);
    }

    /** @override <hr> 
     * *public*  
     * configuracion personalizada para la eliminacion
     * ____
     */ 
    public delete(
        _id:string, 
        hookParams:IUsuarioHookParams,
        _pathBase="", 
    ){
        //configuracion personalizada para el hookParams
        hookParams = (hookParams && hookParams != null) ? 
                     hookParams : this.getDefHookParamsInstance();

        return super.delete(_id, hookParams, _pathBase);
    }

    //================================================================
    //utilitarios sobreescritos obligatorios  

    /** @override <hr>  
     * *public*  
     * ____
     */
    public getModelFormatter():UsuarioFormatter{
        const r = <UsuarioFormatter>this.modelFormatter;
        return r
    } 

    /** @override <hr>  
     * *public*  
     * ____
     */
    // public getModelValidator():UsuarioValidator{
    //     const r = <UsuarioValidator>this.modelValidator;
    //     return r
    // }     

    /** @override <hr>  
     * *public*  
     * ____
     */
    public getModelPopulator():UsuarioPopulator{
        const r = <UsuarioPopulator>this.populator;
        return r
    }    
    
    /** @override <hr>  
     * *public*  
     * ____
     */
    public getDefFilterInstance():IUsuarioFilter{
        const r = this.modelFilterHandler.getFilterPrototype();
        return <IUsuarioFilter> r
    }

    /** @override <hr>  
     * *public*  
     * ____
     */
    public getDefPopulationFilterInstance():IUsuarioPopulationFilter{
        const r = this.modelFilterHandler.getPopulationFilterPrototype();
        return <IUsuarioPopulationFilter> r
    }    

    /** @override <hr>  
     * *public*  
     * ____
     */
    public getDefHookParamsInstance():IUsuarioHookParams{
        const r = this.modelHookHandler.getHookParamsPrototype();
        return <IUsuarioHookParams> r;
    }


}