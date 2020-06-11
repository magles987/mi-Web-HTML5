import { v4 } from "uuid";
//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*class Util_Components*/
//contienen funcionalidades utilitarias para la creacion de componentes
export class Util_Components {

    constructor() {}

    /*createAttIdComponentFortemplate()*/
    //crea un id unico para el elemento envolvente del 
    //template de un componente vue
    //Parametros:
    //prefixTlpComp : prefijo del componente
    public createAttIdComponentFortemplate(prefixTlpComp:string):void{
        let elem_TlpComp = document.getElementById(prefixTlpComp);
        
        let id_etc = v4();
        id_etc = id_etc.replace(/-/g, ""); //quitar guiones

        elem_TlpComp.setAttribute("id", `${prefixTlpComp}-${id_etc}`)
    }

}
