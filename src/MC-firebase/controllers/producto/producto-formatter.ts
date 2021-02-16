//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████

import { Formatter } from "../formatter";
import { IProductoMetaFtBoolean, IProductoMetaFtNumber, IProductoMetaFtString, IProductoMetaFtDate, IProductoMetaFtRegExp } from "./producto-meta";

/** @info <hr>  
 * *class*  
 * formateador personalizado para cada modelo
 * solo cuando se desee metodos *override* 
 * personalizados para cada tipo de formateo
 * ____
 * *extends:*  
 * `Formatter`  
 * ____
 */
export class ProductoFormatter extends Formatter {

    /** 
     * `constructor()`  
     * 
     * ____
     */
    constructor(){
        super();
    }

    /** @override<hr>  
     * *public*  
     * ...
     * ____
     */
    // public formatVBoolean(value:boolean, metaFormat:IProductoMetaFtBoolean):boolean{
    //     value = super.formatVBoolean(value, metaFormat);
    //     //..aqui la personalizacion
    //     return value;
    // }
    /** @override<hr>  
     * *public*  
     * ...
     * ____
     */
    // public formatVNumber(value:number, metaFormat:IProductoMetaFtNumber):number{
    //     value = super.formatVNumber(value, metaFormat);
    //     //..aqui la personalizacion
    //     return value;
    // }
    /** @override<hr>  
     * *public*  
     * ...
     * ____
     */
    // public formatVString(value:string, metaFormat:IProductoMetaFtString):string{
    //     value = super.formatVString(value, metaFormat);
    //     //..aqui la personalizacion
    //     return value;
    // }
    /** @override<hr>  
     * *public*  
     * ...
     * ____
     */
    // public formatVDate(value:any, metaFormat:IProductoMetaFtDate):any{
    //     value = super.formatVDate(value, metaFormat);
    //     //..aqui la personalizacion
    //     return value;
    // }
    /** @override<hr>  
     * *public*  
     * ...
     * ____
     */
    // public formatVRegExp(value:any, metaFormat:IProductoMetaFtRegExp):any{
    //     value = super.formatVRegExp(value, metaFormat);
    //     //..aqui la personalizacion
    //     return value;
    // }    


}