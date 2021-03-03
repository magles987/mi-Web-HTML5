import { IProducto, Producto } from "../../models/producto/producto-m";
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
export interface IProductoMetaFtBoolean extends IMetaFtBoolean {
    //aqui la personalizacion
}
/** @info <hr>  
 * *interface*  
 * ____
 * *extends:*  
 * `IMetaFtNumber`
 * ____
 */
export interface IProductoMetaFtNumber extends IMetaFtNumber {
    //aqui la personalizacion
}
/** @info <hr>  
 * *interface*  
 * ____
 * *extends:*  
 * `IMetaFtString`
 * ____
 */
export interface IProductoMetaFtString extends IMetaFtString {
    //aqui la personalizacion
}
/** @info <hr>  
 * *interface*  
 * ____
 * *extends:*  
 * `IMetaFtDate`
 * ____
 */
export interface IProductoMetaFtDate extends IMetaFtDate {
    //aqui la personalizacion
}
/** @info <hr>  
 * *interface*  
 * ____
 * *extends:*  
 * `IMetaFtRegExp`
 * ____
 */
export interface IProductoMetaFtRegExp extends IMetaFtRegExp {
    //aqui la personalizacion
}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class* `ProductoMeta`
 * metadata correspondiente al Modelo 
 * ____
 * *extends:*  
 * `ModelMetadata`  
 * *implements:*  
 * `IProducto<any>`  
 * ____
 */
export class ProductoMeta extends ModelMetadata implements IProducto<any>{
    
    //================================================================
    //Metadato de la coleccion y el modelo
    /**@override */
    __nomColeccion = nomsModel_Dictionary.Producto.P;
    /**@override */
    __nomModel = nomsModel_Dictionary.Producto.S
    /**@override */
    __typeCollection = ETypeCollection.collection;
    
    //================================================================
    //Campos del Modelo
    /**@borrows */
    _id:IFieldMeta<string, any> = {
        nom:"_id",
        default:"",
        fieldType: EFieldType._system,
        isArray :false,
        formatFieldMeta: {}
    };
    /**@borrows */
    _pathDoc:IFieldMeta<string, any> = {
        nom:"_pathDoc",
        default:"",
        fieldType: EFieldType._system,
        isArray :false,
        formatFieldMeta: {}
    };

    fk_PruebaProd:IFieldMeta<Producto[] | string[], "this"> = {
        nom:"fk_PruebaProd",
        default:[],
        fieldType: EFieldType.foreignKey,
        isArray : true,
        structureFConfig : {
            extModelMeta : "this",
            typeRef : "_pathDoc",
            cardinality : "many",             
        },
        formatFieldMeta: {},

    }
    
    //================================================================
    constructor(){super()}

}