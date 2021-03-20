import { HookHandler, IHookParams } from "../hook-handler";
import { Usuario, IUsuario } from "../../models/usuario/usuario-m";
import { UsuarioMeta } from "./usuario-meta";
import { UsuarioFormatter } from "./usuario-formatter";
import { IUsuarioFilter } from "./usuario-filter-handler";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *interface*
 * 
 * ____
 * *extends:*  
 * `IHookParams`
 * ____
 */
export interface IUsuarioHookParams extends IHookParams {
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
export class UsuarioHookHandler extends HookHandler<Usuario, UsuarioMeta>{

    /** @override  <hr>  
     * *protected*
     * ____
     */
    protected defaultModelHookParams:IUsuarioHookParams

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
    public getHookParamsPrototype():IUsuarioHookParams{
        let hookPm_inst = <IUsuarioHookParams> {
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
        hookParams: IUsuarioHookParams, 
        filter?:IUsuarioFilter
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
        docs: Usuario | Usuario[], 
        hookParams: IUsuarioHookParams, 
        filter?:IUsuarioFilter
    ): Promise<Usuario | Usuario[]> {
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
        docs: Usuario | Usuario[], 
        hookParams: IHookParams, 
        filter?:IUsuarioFilter
    ): Usuario | Usuario[] {
        //...aqui la personalizacion del hook
        return super.postGetWithOutPromise(docs, hookParams, filter);
    }

    /** @override<hr>  
     * *public*  
     * ____
     */
    public preCreate(
        doc:Usuario, 
        modelMeta:UsuarioMeta, 
        hookParams: IUsuarioHookParams
    ): Promise<Usuario> {
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
        doc:Usuario, 
        hookParams: IUsuarioHookParams
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
        doc: Usuario, 
        modelMeta:UsuarioMeta, 
        hookParams: IUsuarioHookParams
    ): Promise<Usuario> {
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
        doc: Usuario, 
        hookParams: IUsuarioHookParams
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
        deletedDoc: Usuario, 
        modelMeta:UsuarioMeta, 
        hookParams: IUsuarioHookParams
    ): Promise<Usuario> {
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
        deletedDoc: Usuario, 
        hookParams: IUsuarioHookParams
    ): Promise<void> {
        return super.postDelete(deletedDoc, hookParams)
        .then(()=>{
            //....aqui la personalizacion del hook
            return;
        });
    }
}