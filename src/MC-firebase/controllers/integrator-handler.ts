import { Fb_Controller } from "./fb-controller";
import { IFieldMeta, ETypeField } from "./meta";
//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████

/** @info <hr>  
 * *interface* `IIntegrate`
 * 
 * **Descripción:**  
 * 
 * ____
 */
export interface IIntegrated {
    _idReference:string;
    getCtrl:()=>Fb_Controller<unknown, unknown, unknown>;
}
//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *abstract class*  
 * descrip... 
 * ____
 */
export abstract class IntegratorHandler{

    /** *protected*  
     * descrip...
     * ____
     */
    protected listIntegrateds:IIntegrated[];

    /** 
     * `constructor()`  
     * descrip...
     * 
     * *Param:*  
     * `` 
     * ____
     */
    constructor() {}


    /** 
     * *public*  
     * compone los campos *mapClon_*, con los que este asociado el modelo
     * ____
     */
    public composeMapClon<TModel,TModelMeta, TField>(
        doc:TModel,
        modelMeta:TModelMeta, 
        nomField:string,
        mapClon?:TField,
        mapClonByReference?:{
            _pathDoc_Or_id:string,
            modelControllerOrigin:Fb_Controller<unknown, unknown, unknown>,
            _pathBase?:string 
        },      
    ):Promise<TModel> {

        /*determina que exista al menos 
        un parametro de referencia */
        if ((!mapClon || mapClon == null) &&
            (!mapClonByReference || mapClonByReference == null)
        ) {
            throw new Error("falta al menos un parametro entre [mapClon, mapClonByReference]");
        }

        if ((!doc || doc == null) || typeof doc != "object" ||
            (!modelMeta[nomField] || modelMeta[nomField] == null)
        ) {
            return Promise.resolve(doc);
        }

        const fMeta = <IFieldMeta<unknown, any>><unknown>modelMeta[nomField];
        
        /*si se recibió el objeto mapClon */
        if (mapClon && mapClon != null) {
            if (fMeta.typeField == ETypeField.mapClon) {
                doc[nomField] = mapClon;
            }            
            return Promise.resolve(doc);
        }

        
        return;
    }

}
