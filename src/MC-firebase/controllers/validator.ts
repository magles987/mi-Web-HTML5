import { EFieldType, ETypeCollection, IFieldMeta, ModelMetadata, nomsModel_Dictionary } from "./meta";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *abstract class*  
 * descrip... 
 * ____
 */
export abstract class Validator{

    /** *private*  
     * determinar si se valida la metadata
     * ____
     */
    private isValMeta =true;
    

    /** 
     * `constructor()`  
     * descrip...
     * 
     * *Param:*  
     * `` 
     * ____
     */
    constructor(
        /**
         * corresponde a los metadatos de este modelo
         */
        private modelMeta:ModelMetadata
    ) {}

    /** 
     * *public*  
     * permite validad si esta tienen una estructura 
     * coherente los metadatos del modelo
     * ____
     */
    public validateModelMetada(
        modelMeta?:ModelMetadata
    ){

        if (!this.isValMeta) {
            return;
        }

        modelMeta = (!modelMeta || modelMeta == null) ? 
                    this.modelMeta : modelMeta;   

        if (!modelMeta.__typeCollection || modelMeta.__typeCollection == null) {
            throw new Error("__typeCollection");  
        }

        /**Verificar nombre de coleccion y modelo solo si es estructura compleja*/
        if (modelMeta.__typeCollection != ETypeCollection.objectOnly) {
            if (!modelMeta.__nomColeccion || modelMeta.__nomColeccion == null) {
                throw new Error("__nomColeccion");  
            }
            if (!modelMeta.__nomModel || modelMeta.__nomModel == null) {
                throw new Error("__nomModel");  
            }
            if (!nomsModel_Dictionary.hasOwnProperty(modelMeta.__nomModel)) {
                throw new Error(`el nombre del modelo ${modelMeta.__nomModel} no esta registradoe en el nomsModel_Dictionary`); 
            }                   
        }    
        
        for (const key in modelMeta) {
            this.validateFieldMeta(key, modelMeta[key]);
        }
        
        return;
    }

    /** 
     * *private*  
     * descrip...
     * 
     * ____
     */
    private validateFieldMeta(
        key:string,
        fieldMeta:IFieldMeta<any, unknown>
    ){  
        //determinar si es campo con metadata
        if (!fieldMeta.nom || fieldMeta.nom == null) {
            return;
        }

        if (fieldMeta.nom != key) {
            throw new Error(`la metadata nom = ${fieldMeta.nom}, no corresponde al campo ${key}`);  
        }

        if (!fieldMeta.fieldType || fieldMeta.fieldType == null) {
            throw new Error(`el campo ${key} no define un fieldType`);  
        }

        if (fieldMeta.fieldType == EFieldType._system) {
            return;
        }

        /**Campos estructurales o referenciales */
        if (fieldMeta.fieldType == EFieldType.foreign ||
            fieldMeta.fieldType == EFieldType.objectOrMap ||
            fieldMeta.fieldType == EFieldType.embedded
        ) {
            if ((!fieldMeta.structureFConfig || fieldMeta.structureFConfig == null) &&
                (!fieldMeta.structureFConfig.extModelMeta || fieldMeta.structureFConfig.extModelMeta == null)
            ) {
                throw new Error(`el campo ${key} es un campo estructural o referencial y requiere la configuracion structureFConfig`);  
            }

            /**Campos referenciales */
            if (
                fieldMeta.fieldType == EFieldType.foreign ||
                fieldMeta.fieldType == EFieldType.embedded
            ) {
                if (!fieldMeta.structureFConfig.typeRef || 
                    fieldMeta.structureFConfig.typeRef == null
                ) {
                    throw new Error(`el campo ${key} es un campo referencial y debe tener el tipo de referencia`);  
                }

                if (!fieldMeta.structureFConfig.cardinality || 
                    fieldMeta.structureFConfig.cardinality == null
                ) {
                    throw new Error(`el campo ${key} es un campo referencial y debe tener cardinalidad`);  
                }
    
                if (fieldMeta.structureFConfig.typeRef == "_pathDoc" &&

                     fieldMeta.structureFConfig.cardinality == "one" &&
                     fieldMeta.isArray == true
                ) {
                    throw new Error(`el campo ${key} tiene cardinalidad one y no puede tener asignacion isArray`);  
                }

                if (fieldMeta.structureFConfig.typeRef == "_pathDoc" &&

                     fieldMeta.structureFConfig.cardinality == "many" &&
                     (!fieldMeta.isArray)
                ) {
                    throw new Error(`el campo ${key} tiene cardinalidad many y debe tener asignacion isArray`);  
                }                

                //---hasta que firestore permita consultar array de map (objetos)---
                if (fieldMeta.structureFConfig.typeRef == "_docClone"  &&
                    fieldMeta.isArray == true
                ) {
                    throw new Error(`el campo ${key} no puede ser isArray`);  
                }  
               
            }

            return;
        }
        
    }
    

}
