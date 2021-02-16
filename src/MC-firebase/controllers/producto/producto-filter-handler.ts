import { FilterHandlerCtrl, IFilter, IPopulationFilter } from "../filter-handler";
import { IProducto } from "../../models/producto/producto-m";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *interface*
 * propiedades customizadas para el prototipo de 
 * un *modelFilter* para este modelo
 * ____
 */
export interface IProductoFilter extends IFilter<IProducto<"asc"|"desc">>{
    //...aqui la customizacion
}
//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *interface*  
 * propiedades customizadas para el prototipo de 
 * un *modelPopulateFilter* para este modelo
 * ____
 */
export interface IProductoPopulationFilter extends IPopulationFilter<IProducto<unknown>>{
    //...aqui la customizacion
}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████

/** @info <hr>  
 * *class*  
 * manejador de objetos prototipos para 
 * filtrado de consultas para este modelo
 * ____
 * *extends:*  
 * `FilterHandlerCtrl`  
 * ____
 */
export class ProductoFilterHandlerCtrl extends FilterHandlerCtrl<IProducto<any>> {

    /** @override  <hr>  
     * *protected*
     * declaracion con tipado exclusivo 
     * para este *modelFilter*
     */
    protected defaultModelFilter:IProductoFilter;

    /** @override  <hr>  
     * *protected*
     * declaracion con tipado exclusivo 
     * para este *modelPopulationFilter*
     */
    protected defaultModelPopulationFilter:IProductoPopulationFilter;

    /** 
     * `constructor()`  
     * configura los valores predefinidos 
     * para este modelo de prototipo de 
     * *modelFilter* y *modelPopulationFilter*
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

       /**Aqui modificar propiedades default si se 
        * requiere una customizacion mas especial*/
       this.defaultModelFilter.limit = 5;
       this.defaultModelPopulationFilter.limit = 2;

    }

    /** @override<hr>  
     * *public*  
     * ...
     * ____
     */
    public getFilterPrototype(): IProductoFilter {
        /**Instancia Nueva No referencial */
        let filter_Prot = {
            ...this.defaultModelFilter
        };

        return filter_Prot;
    }

    /** @override<hr>  
     * *public*  
     * ...
     * ____
     */
    public getPopulationFilterPrototype(): IProductoPopulationFilter {
        /**Instancia Nueva No referencial */
        let filter_Prot = {
            ...this.defaultModelPopulationFilter
        };

        return filter_Prot;
    }    

}