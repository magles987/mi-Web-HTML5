import { IModel, Model } from "../model";
//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *interface*  
 * **Todos** los campos asignados para el modelo, (entre los que 
 * se cuentan almacenables, virtuales, map, array y referencia a 
 * embebidos) 
 * ____
 * *extends:*  
 * `IModel`
 * 
 * *Types:*  
 * `TExtend` : Tipo dinamico para asignar estructuras de 
 * configuracion donde todos los campos tengan el mismo 
 * tipo (ejemplo los metadatos)
 * ____
 */
export interface IProducto<TExtend> extends IModel<TExtend>{

    nombre? : TExtend
    precio? : TExtend;
    categoria? : TExtend;

    map_miscelanea? : IMap_miscelanea<TExtend> | any; 
    mapA_misc?: IMapA_misc<TExtend> | any;

    fk_PruebaProd?:TExtend;

    emb_SubColeccion?:TExtend;

    v_precioImpuesto?:TExtend;

}

/** @info <hr>  
 * *interface*
 * representa un campo especial map
 * ____
 */
export interface IMap_miscelanea<TExtend>{
    tipo? : TExtend;
    ruedas? : TExtend;
}

/** @info <hr>  
 * *interface*
 * representa un campo especial map de array
 * ____
 */
export interface IMapA_misc<TExtend>{
    color?:TExtend;
}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class*  
 * clase modelo para instancia o de referencia, 
 * con campos pre inicializados, los campos deben 
 * ser asignados de acuerdo al **tipo*** que tienen 
 * almacenado en la BD.  
 * **Recordar:** esta clase no debe tener constructor 
 * ni metodos
 * ____
 * *extends:*  
 * `Model`
 * 
 * *implements*  
 * `IProducto<any>`
 * ____
 */
export class Producto extends Model implements IProducto<any> {

    nombre:string = "";
    categoria:string = "";
    precio:number = 0;

    emb_SubColeccion:any = null;
    fk_PruebaProd:string[]=[]

    v_precioImpuesto?:number = 0;

}
