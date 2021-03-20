import { ModelMetadata } from "../meta";
import { Validator } from "../validator";
//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████

/** @info <hr>  
 * *abstract class*  
 * descrip... 
 * ____
 * *extends:*  
 * ``  
 * ____
 */
export class ProductoValidator extends Validator {

    /** 
     * `constructor()`  
     * descrip...
     * 
     * *Param:*  
     * `modelMeta` : correspondiente a los metadatos de este modelo 
     * ____
     */
    constructor(
        modelMeta:ModelMetadata
    ) {
        super(modelMeta);
    }

}
