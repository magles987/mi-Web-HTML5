import { HookHandler, IHookParams } from "../hook-handler";
import { Producto, IProducto } from "../../models/producto/producto-m";
import { ProductoMeta } from "./producto-meta";
import { ProductoFormatter } from "./producto-formatter";
import { IProductoFilter } from "./producto-filter-handler";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *interface*
 * 
 * ____
 * *extends:*  
 * `IHookParams`
 * ____
 */
export interface IProductoHookParams extends IHookParams {
    //================================   
    //para pre lectura:

    //================================   
    //para post lectura:    

    //================================   
    //para pre Modificacion (crear, actualizar, eliminar):

    //================================   
    //para post Modificacion (crear, actualizar, eliminar):
}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class*  
 * descrip...  
 * ____
 * *extends:*  
 * `HookHandler`  
 * ____
 */
export class ProductoHookHandler extends HookHandler<Producto, ProductoMeta>{

    /** @override  <hr>  
     * *protected*
     * ____
     */
    protected defaultModelHookParams:IProductoHookParams

    /** 
     * `constructor()`  
     * configura los valores predefinidos 
     * para este modelo de prototipo de 
     * *modelHook*
     * ____
     */
    constructor(){
        super();
        /**Asignar los demas valores predefinidos 
         * para la instancia default de 
         * *modelHookParams* */
        this.defaultModelHookParams = {
            ...this.startDefault(),

        }
    }

    /** @override<hr>  
     * *public*  
     * ____
     */
    public getHookParamsPrototype():IProductoHookParams{
        let hookPm_inst = <IProductoHookParams> {
            ...this.defaultModelHookParams
        }
        return hookPm_inst;
    }

    /** @override<hr>  
     * *public*  
     * 
     * ____
     */
    public preGet(
        hookParams: IProductoHookParams, 
        filter?:IProductoFilter
    ): Promise<void> {      
        return super.preGet(hookParams, filter)
            .then(()=>{
                //....aqui la personalizacion del hook
            });
    }

    /** @override<hr>  
     * *public*  
     * ____
     */
    public postGet(
        docs: Producto | Producto[], 
        hookParams: IProductoHookParams, 
        filter?:IProductoFilter
    ): Promise<Producto | Producto[]> {
        return super.postGet(docs, hookParams)
        .then((docs)=>{
            //....aqui la personalizacion del hook
            return docs;
        });
    }
    /** @override<hr>  
     * *public*  
     * 
     * ____
     */    
    public postGetWithOutPromise(
        docs: Producto | Producto[], 
        hookParams: IHookParams, 
        filter?:IProductoFilter
    ): Producto | Producto[] {
        //...aqui la personalizacion del hook
        return super.postGetWithOutPromise(docs, hookParams, filter);
    }

    /** @override<hr>  
     * *public*  
     * ____
     */
    public preCreate(
        doc:Producto, 
        modelMeta:ProductoMeta, 
        hookParams: IProductoHookParams
    ): Promise<Producto> {
        return super.preCreate(doc, modelMeta, hookParams)
        .then((doc)=>{
            //....aqui la personalizacion del hook
            return doc;
        });
    }

    /** @override<hr>  
     * *public*  
     * ____
     */
    public postCreate(
        doc:Producto, 
        hookParams: IProductoHookParams
    ): Promise<void> {
        return super.postCreate(doc, hookParams)
        .then(()=>{
            //....aqui la personalizacion del hook
            return;
        });
    }    

    /** @override<hr>  
     * *public*  
     * 
     * ____
     */
    public preUpdate(
        doc: Producto, 
        modelMeta:ProductoMeta, 
        hookParams: IProductoHookParams
    ): Promise<Producto> {
        return super.preUpdate(doc, modelMeta, hookParams)
        .then((doc)=>{
            //....aqui la personalizacion del hook
            return doc;
        });
    }

    /** @override<hr>  
     * *public*  
     * 
     * ____
     */
    public postUpdate(
        doc: Producto, 
        hookParams: IProductoHookParams
    ): Promise<void> {
        return super.postUpdate(doc, hookParams)
        .then(()=>{
            //....aqui la personalizacion del hook
            return;
        });
    }

    /** @override<hr>  
     * *public*  
     * 
     * ____
     */
    public preDelete(
        deletedDoc: Producto, 
        modelMeta:ProductoMeta, 
        hookParams: IProductoHookParams
    ): Promise<Producto> {
        return super.preDelete(deletedDoc, modelMeta, hookParams)
        .then((doc)=>{
            //....aqui la personalizacion del hook
            return doc;
        });
    }

    /** @override<hr>  
     * *public*  
     *  
     * ____
     */
    public postDelete(
        deletedDoc: Producto, 
        hookParams: IProductoHookParams
    ): Promise<void> {
        return super.postDelete(deletedDoc, hookParams)
        .then(()=>{
            //....aqui la personalizacion del hook
            return;
        });
    }

}