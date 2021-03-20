import { FirebaseConfig } from "../../../ts/firebase-config/firebase-config";
import { Fb_Controller } from "../fb-controller";

import { Producto, IProducto } from "../../models/producto/producto-m";
import { ProductoMeta } from "./producto-meta";
import { ProductoFormatter } from "./producto-formatter";

import { ProductoHookHandler, IProductoHookParams } from "./producto-hook-handler";
import { ProductoFilterHandlerCtrl, IProductoFilter, IProductoPopulationFilter } from "./producto-filter-handler";
import { Fb_Paginator } from "../fb-paginator";
import { ProductoRelationshipHandler } from "./producto-relationship-handler";
import { ProductoValidator } from "./producto-validator";


//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class singleton*
 * Controller para este Modelo
 * ____
 * *extends:*  
 * `Fb_Controller`  
 * ____
 */
export class ProductoController extends Fb_Controller<Producto, IProducto<any>, ProductoMeta>{

    /** *private static*   
     * Almacena la instancia única de esta clase
     * ____
     */
    private static instance:ProductoController;

    /** 
     * `constructor()`  
     * 
     * ____
     */
    constructor(){
        super();
        //configurar los metadatos tanto el offline como el de cloudFn
        this.modelMeta_Offline = new ProductoMeta();
        this.updateModelMetada().catch((error)=>{ console.log(error)});
        
        this.modelValidator = new ProductoValidator(this.modelMeta);
        this.modelValidator.validateModelMetada();

        this.paginator = new Fb_Paginator("classic");
        this.relationshipHandler = new ProductoRelationshipHandler(this.modelMeta_Offline, 
                                new Fb_Paginator("classic"));
        this.modelFormatter = new ProductoFormatter();

        this.modelFilterHandler = new ProductoFilterHandlerCtrl();
        this.modelHookHandler = new ProductoHookHandler();

    }

    /** *public static* `getInstance()`  
     * devuelve la instancia única de esta clase  
     * ya sea que la crea o la que ya a sido creada
     * ____
     */
    public static getInstance():ProductoController{
        ProductoController.instance = (!ProductoController.instance || ProductoController.instance == null) ?
                    new ProductoController() : ProductoController.instance;
        return ProductoController.instance;
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
        filter:IProductoFilter, 
        hookParams?:IProductoHookParams,
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

        /**Determinar orden */
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
        newDoc:Producto, 
        hookParams?:IProductoHookParams, 
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
        updatedDoc:Producto, 
        hookParams:IProductoHookParams,  
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
        deletedDoc:Producto, 
        hookParams:IProductoHookParams,
        _pathBase="", 
    ){
        //configuracion personalizada para el hookParams
        hookParams = (hookParams && hookParams != null) ? 
                     hookParams : this.getDefHookParamsInstance();

        return super.delete(deletedDoc, hookParams, _pathBase);
    }

    //================================================================
    //utilitarios sobreescritos obligatorios  

    /** @override <hr>  
     * *public*  
     * ____
     */
    public getModelFormatter():ProductoFormatter{
        const r = <ProductoFormatter>this.modelFormatter;
        return r
    } 

    /** @override <hr>  
     * *public*  
     * ____
     */
    public getModelValidator():ProductoValidator{
        const r = <ProductoValidator>this.modelValidator;
        return r
    }     

    /** @override <hr>  
     * *public*  
     * ____
     */
    public getModelPopulator():ProductoRelationshipHandler{
        const r = <ProductoRelationshipHandler>this.relationshipHandler;
        return r
    }    
    
    /** @override <hr>  
     * *public*  
     * ____
     */
    public getDefFilterInstance():IProductoFilter{
        const r = this.modelFilterHandler.getFilterPrototype();
        return <IProductoFilter> r
    }

    /** @override <hr>  
     * *public*  
     * ____
     */
    public getDefPopulationFilterInstance():IProductoPopulationFilter{
        const r = this.modelFilterHandler.getPopulationFilterPrototype();
        return <IProductoPopulationFilter> r
    }    

    /** @override <hr>  
     * *public*  
     * ____
     */
    public getDefHookParamsInstance():IProductoHookParams{
        const r = this.modelHookHandler.getHookParamsPrototype();
        return <IProductoHookParams> r;
    }

}