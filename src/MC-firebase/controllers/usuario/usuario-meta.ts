import { IUsuario, Imap_Perfil, Imap_PColaborador, Imap_PCliente } from "../../models/usuario/usuario-m";
import { ModelMetadata, nomsModel_Dictionary, IFieldMeta, IMetaFtBoolean, IMetaFtNumber, IMetaFtString, IMetaFtDate, IMetaFtRegExp, EFieldType, ETypeCollection } from "../meta";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
//personalizacion de interfaces heredadas de matadata 
//para formateo de valores o datos

/** @info <hr>  
 * *interface*  
 * ____
 * *extends:*  
 * `IMetaFtBoolean`
 * ____
 */
export interface IUsuarioMetaFtBoolean extends IMetaFtBoolean {
    //aqui la personalizacion
}
/** @info <hr>  
 * *interface*  
 * ____
 * *extends:*  
 * `IMetaFtNumber`
 * ____
 */
export interface IUsuarioMetaFtNumber extends IMetaFtNumber {
    //aqui la personalizacion
}
/** @info <hr>  
 * *interface*  
 * ____
 * *extends:*  
 * `IMetaFtString`
 * ____
 */
export interface IUsuarioMetaFtString extends IMetaFtString {
    //aqui la personalizacion
}
/** @info <hr>  
 * *interface*  
 * ____
 * *extends:*  
 * `IMetaFtDate`
 * ____
 */
export interface IUsuarioMetaFtDate extends IMetaFtDate {
    //aqui la personalizacion
}
/** @info <hr>  
 * *interface*  
 * ____
 * *extends:*  
 * `IMetaFtRegExp`
 * ____
 */
export interface IUsuarioMetaFtRegExp extends IMetaFtRegExp {
    //aqui la personalizacion
}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class*
 * metadata correspondiente al Modelo 
 * ____
 * *extends:*  
 * `ModelMetadata`  
 * *implements:*  
 * `IProducto<any>`  
 * ____
 */
export class UsuarioMeta extends ModelMetadata implements IUsuario<IFieldMeta<any, unknown>>{
    
    //================================================================
    //Metadato de la coleccion y el modelo
    /**@override */
    __nomColeccion = nomsModel_Dictionary.Usuraio.P;
    /**@override */
    __nomModel = nomsModel_Dictionary.Usuraio.S
    /**@override */
    __typeCollection = ETypeCollection.collection;
    
    //================================================================
    //Campos del Modelo
    /**@borrows */
    _id:IFieldMeta<string, unknown> = {
        nom: "_id",
        default: "",
        isArray:false,
        fieldType: EFieldType._system,
        formatFieldMeta: {}
    };
    /**@borrows */
    _pathDoc:IFieldMeta<string, unknown> = {
        nom: "_pathDoc",
        default: "",
        isArray:false,
        fieldType: EFieldType._system,
        formatFieldMeta: { }
    };

    //---------------

    map_Perfil:IFieldMeta<Imap_Perfil<any>, map_PerfilMeta> = {
        nom: "map_Perfil",
        default: {},
        isArray:false,
        fieldType: EFieldType.objectOrMap,
        structureFConfig:{
            extModelMeta : new map_PerfilMeta(),
        },
        formatFieldMeta: {},
    }
    
    //================================================================
    constructor(){super()}

}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
//metadata extendida de campos especiales (map o mapA)
/** @info <hr>  
 * *class*  
 * descrip...  
 * ____
 * *implements:*  
 * ``  
 * ____
 */
class map_PerfilMeta extends ModelMetadata implements Imap_Perfil<any> {
    
    //================================================================
    //Metadato de la coleccion a la que pertenece esta 
    //sub estructura u objeto
    /**@override */
    __nomColeccion = nomsModel_Dictionary.Usuraio.P;
    /**@override */
    __nomModel = nomsModel_Dictionary.Usuraio.S
    /**@override */
    __typeCollection = ETypeCollection.objectOnly;

    //================================================================    
    tipo:IFieldMeta<string, unknown> = {
        nom: "tipo",
        default: "",
        isArray : false,
        fieldType: EFieldType.string,
        formatFieldMeta: { }
    };
    subTipo:IFieldMeta<string, unknown> = {
        nom: "subTipo",
        default: "",
        isArray : false,
        fieldType: EFieldType.string,
        formatFieldMeta: {  }
    };
    map_Tipo = <IFieldMeta<Imap_PColaborador<any> & Imap_PCliente<any>, unknown>>{
        nom: "map_Tipo",
        default: {},
        isArray : false,
        fieldType: EFieldType.objectOrMap,
        structureFConfig : {
            extModelMeta : null,// --error
            isReferencial : false
        },
        formatFieldMeta: { },

    }

    //================================================================
    constructor(){super()}


}