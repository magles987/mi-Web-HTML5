//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *interface* `IModel`
 * contiene los campos comunes para **todos** los modelos
 * ____
 * Types:
 * `TExtend` : Tipo dinamico para asignar estructuras de 
 * configuracion donde todos los campos tengan el mismo 
 * tipo (ejemplo los metadatos)
 * ____
 */
export interface IModel<TExtend> {
    /**id personalizado para cada documento 
     * por ahora proveido por npm uuid
    */
    _id:TExtend;
    /**ruta base para acceder al documento (util  
     * para las subcolecciones o embebidos) 
     */
    _pathDoc? : TExtend; 

    /**indica la ultima fecha de modificacion del 
     * documento (o su creacion)
     */    
    // _modAt : TExtend;

    /**indica si el documento esta activo
     * potencialmente usar booleano numerico
     */    
    // _isActive : TExtend;    

}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class* `Model`  
 * contiene los campos (ya preinicializados)
 * comunes para todos los modelos
 * **Recomendado:** no establecer constructor 
 * para esta clase ni sus hijas 
 * ____
 */
export class Model implements IModel<any>{

    /**@borrows <hr>   
     * inicializa en `""`
    */
    _id = "";
    /**@borrows <hr>   
     * inicializa en `""`
     */
    _pathDoc = "";

    /**@borrows <hr>   
     * inicializa en `timestamp` actual
    */
    // _modAt = Date.now();

    /**@borrows <hr>   
     * inicializa en `1`
     * **IMPORTANTE** se debe usar booleano 
     * numerico `0` es `false` o `1` es `true`
     */
    // _isActive = 1;    

}