import { FilterHandlerCtrl, IFilter, IPopulationFilter } from "../filter-handler";
import { IUsuario } from "../../models/usuario/usuario-m";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *interface*  
 * propiedades customizadas para el prototipo de 
 * un *modelFilter* para este modelo
 * ____
 */
export interface IUsuarioFilter extends IFilter<IUsuario<"asc"|"desc">>{
    //...aqui la customizacion
}
//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *interface*  
 * propiedades customizadas para el prototipo de 
 * un *modelPopulateFilter* para este modelo
 */
export interface IUsuarioPopulationFilter extends IPopulationFilter<IUsuario<unknown>>{
    //...aqui la customizacion
}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████

/** @info <hr>  
 * *class*  
 * manejador de objetos prototipos para 
 * filtrado de consultas para este modelo
 * ____
 * *extends:*  
 * `FilterCtrl`  
 * ____
 */
export class UsuarioFilterHandlerCtrl extends FilterHandlerCtrl<IUsuario<any>> {

    /** @override  <hr>  
     * *protected*
     * declaracion con tipado exclusivo 
     * para este *modelFilter*
     */
    protected defaultModelFilter:IUsuarioFilter;

    /** @override  <hr>  
     * *protected*
     * declaracion con tipado exclusivo 
     * para este *modelPopulationFilter*
     */
    protected defaultModelPopulationFilter:IUsuarioPopulationFilter;    
    
    /** 
     * `constructor()`  
     * configura los valores predefinidos 
     * para este modelo de prototipo de 
     * *modelFilter*
     * ____
     */    
    constructor(){
        super();
        /**asignar valores predefinidos 
         * para la instancia default
        */
        this.defaultModelFilter = {
           /** retorna y asigna *Extracto* de objeto con 
            * propiedades factorizdas*/
           ...this.startDefaultFilter(),
           /**Inicializar propiedades default personalizadas 
            * para este *modelFilter* */
           
        };       
        this.defaultModelPopulationFilter = {
            /** retorna y asigna *Extracto* de objeto con 
            * propiedades factorizdas*/
           ...this.startDefaultPopulationFilter(),
           /**Inicializar propiedades default personalizadas 
            * para este *modelPopulationFilter* */           
        };

    }

    /** @override<hr>  
     * *public*  
     * ...
     * ____
     */
    public getFilterPrototype(): IUsuarioFilter {
        /**Instancia Nueva No referencial */
        let filter_Prot = <IUsuarioFilter>{
            ...this.defaultModelFilter
        };

        return filter_Prot;
    }

    /** @override<hr>  
     * *public*  
     * ...
     * ____
     */
    public getPopulationFilterPrototype(): IUsuarioPopulationFilter {
        /**Instancia Nueva No referencial */
        let filter_Prot = {
            ...this.defaultModelPopulationFilter
        };

        return filter_Prot;
    }     

}