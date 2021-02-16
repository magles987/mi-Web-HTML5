//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████

import { Formatter } from "../formatter";
import { IUsuarioMetaFtBoolean, IUsuarioMetaFtNumber, IUsuarioMetaFtString, IUsuarioMetaFtDate, IUsuarioMetaFtRegExp } from "./usuario-meta";

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
export class UsuarioFormatter extends Formatter {

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
    // public formatVBoolean(value:boolean, metaFormat:IUsuarioMetaFtBoolean):boolean{
    //     value = super.formatVBoolean(value, metaFormat);
    //     //..aqui la personalizacion
    //     return value;
    // }
    /** @override<hr>  
     * *public*  
     * ...
     * ____
     */
    // public formatVNumber(value:number, metaFormat:IUsuarioMetaFtNumber):number{
    //     value = super.formatVNumber(value, metaFormat);
    //     //..aqui la personalizacion
    //     return value;
    // }
    /** @override<hr>  
     * *public*  
     * ...
     * ____
     */
    // public formatVString(value:string, metaFormat:IUsuarioMetaFtString):string{
    //     value = super.formatVString(value, metaFormat);
    //     //..aqui la personalizacion
    //     return value;
    // }
    /** @override<hr>  
     * *public*  
     * ...
     * ____
     */
    // public formatVDate(value:any, metaFormat:IUsuarioMetaFtDate):any{
    //     value = super.formatVDate(value, metaFormat);
    //     //..aqui la personalizacion
    //     return value;
    // }
    /** @override<hr>  
     * *public*  
     * ...
     * ____
     */
    // public formatVRegExp(value:any, metaFormat:IUsuarioMetaFtRegExp):any{
    //     value = super.formatVRegExp(value, metaFormat);
    //     //..aqui la personalizacion
    //     return value;
    // }    



}