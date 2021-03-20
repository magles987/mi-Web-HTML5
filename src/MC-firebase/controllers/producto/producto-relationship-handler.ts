import { RelationshipHandler } from "../relationship-handler";
import { Producto } from "../../models/producto/producto-m";
import { IFieldMeta, EFieldType } from "../meta";
import { Fb_Paginator } from "../fb-paginator";
import { ProductoMeta } from "./producto-meta";
import { Fb_Controller } from "../fb-controller";

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
export class ProductoRelationshipHandler extends RelationshipHandler<Producto, ProductoMeta> {

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
    }

    /** @override<hr>  
     * *protected*  
     * ....
     * ____
     */
    protected getInputCtrls(){
        /*inicializa el map de forma directa por 
        medio del constructor*/
        const ctrls = new Map([
            //asignar en pares [nom, getCtrl]
            [
                this.modelMeta.__nomModel,
                ()=>ProductoController.getInstance(),  //recursivo a si mismo
            ]
        ]) 
        return ctrls as unknown as Map<string, ()=>Fb_Controller<any,any,any>>

    }

    /** @override<hr>  
     * *protected*  
     * ....
     * ____
     */
    protected getOutputCtrls(){
        /*inicializa el contenedor array de forma directa*/
        const ctrls = [
            //Aqui cada get Ctrl que tenga referencia 
            //de este model
            ()=>ProductoController.getInstance(), //recursivo a si mismo
        ]; 
        return ctrls as unknown as [()=>Fb_Controller<unknown,unknown,unknown>];
    }



}