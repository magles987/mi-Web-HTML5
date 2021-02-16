import { PopulatorHandler } from "../populator-handler";
import { Producto } from "../../models/producto/producto-m";
import { IFieldMeta, EFieldType } from "../meta";
import { Fb_Paginator } from "../fb-paginator";
import { ProductoMeta } from "./producto-meta";


//--para borrar (redundancia solo para pruebas)
import { ProductoController } from "./producto-ctrl";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class*  
 * descrip...  
 * ____
 * *extends:*  
 * ``  
 * ____
 */
export class ProductoPopulator extends PopulatorHandler<Producto, ProductoMeta> {

    /** 
     * `constructor()`  
     * descrip...
     * 
     * *Param:*  
     * `modelMeta` la metadata del modelo 
     * ____
     */
    constructor(
        modelMeta:ProductoMeta,
        populatePaginator:Fb_Paginator
    ){
        super();
        this.modelMeta = modelMeta;
        this.populatePaginator = populatePaginator;

        this.initInputCtrls();
        this.initOutputCtrls();
    }

    /** @override<hr>  
     * *protected*  
     * ....
     * ____
     */
    protected initInputCtrls():void{
        /*inicializa el map de forma directa por 
        medio del constructor*/
        this.inputCtrlsByField = new Map([
            //asignar en pares [nom, getCtrl]
            [
                this.modelMeta.fk_PruebaProd.nom,
                ()=>ProductoController.getInstance(), 
            ]
        ]);
        return;
    }

    /** @override<hr>  
     * *protected*  
     * ....
     * ____
     */
    protected initOutputCtrls():void{
        /*inicializa el contenedor array de forma directa*/
        this.outputCtrls = [
            //Aqui cada get Ctrl que tenga referencia 
            //de este model
            ()=>ProductoController.getInstance(),
        ]; 
        return;
    }

    /** 
     * *public*  
     * descrip...
     * ____
     */
    public populateDoc(doc:Producto, nomFields?:string[]):Producto{
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