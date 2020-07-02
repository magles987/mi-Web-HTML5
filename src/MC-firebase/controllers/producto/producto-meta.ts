import { IProducto } from "../../models/producto/producto-m";
<<<<<<< HEAD
import { ModelMetadata, nomsDictionaryMC, IMetaCampo } from "../meta";
=======
import { ModelMetadata, IMetaCampo } from "../meta";
>>>>>>> 05e6d3fe50914f87dd7f29e123daa3b015a848cf


//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*class ProductoMeta extends ModelMeta implements IProducto<any>*/
//
export class ProductoMeta extends ModelMetadata implements IProducto<any>{
    
    __nomColeccion = nomsDictionaryMC.Producto.P;
    __nomModel = nomsDictionaryMC.Producto.S
    __isEmbSubcoleccion = false;
    __nameFnCloudMeta = "FnProductoMeta";
    
    _id:IMetaCampo<string, any> = {
        nom:"_id",
        default:"",
    };
    _pathDoc:IMetaCampo<string, any> = {
        nom:"_pathDoc",
        default:""
    };
    
    constructor(){
        super()
    }

}