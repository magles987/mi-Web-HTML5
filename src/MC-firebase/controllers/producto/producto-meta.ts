import { IProducto } from "../../models/producto/producto-m";
import { ModelMetadata, IMetaCampo } from "../meta";


//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*class ProductoMeta extends ModelMeta implements IProducto<any>*/
//
export class ProductoMeta extends ModelMetadata implements IProducto<any>{
    
    __nomColeccion = "Producto";
    __isEmbSubcoleccion = false;
    __nameFnCloudMeta = "FnProductoMeta";
    
    _id:IMetaCampo<string, any> = {
        nom:"_id",
        default:"",
    };
    _pathDoc:IMetaCampo<string, any> = {
        nom:"_id",
        default:""
    };
    
    constructor(){
        super()
    }

}