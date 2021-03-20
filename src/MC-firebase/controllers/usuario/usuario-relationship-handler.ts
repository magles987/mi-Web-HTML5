import { RelationshipHandler } from "../relationship-handler";
import { Usuario } from "../../models/usuario/usuario-m";
import { IFieldMeta, EFieldType} from "../meta";
import { Fb_Paginator } from "../fb-paginator";
import { UsuarioMeta } from "./usuario-meta";


//--para borrar (redundancia solo para pruebas)
import { UsuarioController } from "./usuario-ctrl";
import { Fb_Controller } from "../fb-controller";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class*  
 * descrip...  
 * ____
 * *extends:*  
 * ``  
 * ____
 */
export class UsuarioRelationshipHandler extends RelationshipHandler<Usuario, UsuarioMeta> {

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
            // [

            // ]
        ]) 
        return ctrls as unknown as Map<string, ()=>Fb_Controller<any,any,any>>
    }

    /** @override<hr>  
     * *protected*  
     * ....
     * ____
     */
    protected  getOutputCtrls(){
        /*inicializa el contenedor array de forma directa*/
        const ctrls = [
            //Aqui cada get Ctrl que tenga referencia 
            //de este model

        ]; 
        return ctrls as unknown as [()=>Fb_Controller<unknown,unknown,unknown>];
    }



}