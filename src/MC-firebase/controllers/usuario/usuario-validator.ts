import { ModelMetadata } from "../meta";
import { Validator } from "../validator";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class*  
 * descrip...  
 * ____
 * *extends:*  
 * ``  
 * ____
 */
export class UsuarioValidator extends Validator {

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