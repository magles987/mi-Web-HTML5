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
export interface IUsuario<TExtend> extends IModel<TExtend>{

    nombre? : TExtend;
    email?: TExtend;
    telefono?: TExtend;
    map_Perfil?:TExtend;

}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *interface*
 * 
 */
export interface Imap_Perfil<TExtend> {
    tipo?:TExtend;
    subTipo?:TExtend;
    map_Tipo?:TExtend;
}


//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *interface*
 * 
 */
export interface Imap_PColaborador<TExtend> {

}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *interface*
 * 
 */
export interface Imap_PCliente<TExtend> {
    subCliente?:TExtend;
}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** 
 * *enum*  
 * perfilar a los usuarios de acuerdo 
 * a las caracterirticas especificas 
 * 
*/
export enum EPerfilTipo {
    /**cliente global */
    cliente = "cliente",
    /**incluye a todos los relacionados 
     * con la gestion de la aplicacion web */
    colaborador = "colaborador" 
}

/** 
 * *enum*  
 * sub clasificacion de usuarios  
 * 
*/
export enum EPerfilSubTipo{
    COBasico = "COBasico", 
    COAdmin = "COAdmin",
    COProgrammer = "COProgrammer", 
    CLParticular = "CLParticular",
    CLEducativa = "CLEducativa"
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
 * `IUsuario<any>`
 * ____
 */
export class Usuario extends Model implements IUsuario<any> {

    nombre:string = "";
    email:string = "";
    telefono:string = "";
    map_Perfil = new map_Perfil();
}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class*  
 * descrip...  
 * ____
 * *implements:*  
 * `Imap_Perfil<any>`  
 * ____
 */
export class map_Perfil implements Imap_Perfil<any> {

    tipo: EPerfilTipo = EPerfilTipo.cliente;
    subTipo: EPerfilSubTipo = EPerfilSubTipo.CLParticular;
    map_Tipo: map_PColaborador | map_PCliente = new map_PCliente();
}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class*  
 * descrip...  
 * ____
 * *implements:*  
 * `Imap_PColaborador<any>`  
 * ____
 */
export class map_PColaborador implements Imap_PColaborador<any> {

}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class*  
 * descrip...  
 * ____
 * *implements:*  
 * Imap_PCliente<any> 
 * ____
 */
export class map_PCliente implements Imap_PCliente<any> {
    subCliente:"PPersonal" | "PEmpresa" | "EEducativa" |"CFamiliar" | "Fundacion" | "Gobierno" = "EEducativa";
}