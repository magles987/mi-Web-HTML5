import { PopulatorHandler } from "../populator-handler";
import { Usuario } from "../../models/usuario/usuario-m";
import { IFieldMeta, EFieldType} from "../meta";
import { Fb_Paginator } from "../fb-paginator";
import { UsuarioMeta } from "./usuario-meta";


//--para borrar (redundancia solo para pruebas)
import { UsuarioController } from "./usuario-ctrl";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class*  
 * descrip...  
 * ____
 * *extends:*  
 * ``  
 * ____
 */
export class UsuarioPopulator extends PopulatorHandler<Usuario, UsuarioMeta> {

    /** 
     * `constructor()`  
     * descrip...
     * 
     * *Param:*  
     * `modelMeta` la metadata del modelo 
     * ____
     */
    constructor(
        modelMeta:UsuarioMeta,
        populatePaginator:Fb_Paginator
    ){
        super();
        this.modelMeta = modelMeta;
        this.populatePaginator = populatePaginator;

        this.initMapPopulateCtrl();
        this.initReferenceCtrl();
    }

    /** @override<hr>  
     * *protected*  
     * ....
     * ____
     */
    protected initMapPopulateCtrl():void{
        /*inicializa el map de forma directa por 
        medio del constructor*/
        this.mapPopulateCtrlsByField = new Map([
            //asignar en pares [nom, getCtrl]
            // [
            //     xxx.nom,
            //     () => xxx.getInstance()
            // ]
        ]);
        return;
    }

    /** @override<hr>  
     * *protected*  
     * ....
     * ____
     */
    protected initReferenceCtrl():void{
        /*inicializa el contenedor array de forma directa*/
        this.CtrlReferences = [
            //Aqui cada get Ctrl que tenga referencia 
            //de este model
            // () => xxx.getInstance(),
        ]; 
        return;
    }

    /** 
     * *public*  
     * descrip...
     * ____
     */
    public populateDoc(doc:Usuario, nomFields?:string[]):Usuario{
        for (const key in this.modelMeta) {

            let metaField = <IFieldMeta<unknown, any>><unknown>this.modelMeta[key];

            if (nomFields && Array.isArray(nomFields)) {
                const element = this.modelMeta[key];
                
            }else{
                
                if (metaField.fieldType == EFieldType.foreignKey) {
                    
                }
            }
        }
        // this.modelMeta._id.
        return doc;
    }

}