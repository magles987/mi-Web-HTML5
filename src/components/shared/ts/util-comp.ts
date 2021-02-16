import { v4 } from "uuid";
import jquery from "jquery";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*IHooksComponents:*/
//algunos hooks pertenecientes al ciclo 
//de vida del componente (IMPORTANTE: no estan todos)
// export interface IHooksComponents {
//     created?(): void;
//     mounted?(): void;
//     updated?(): void;
//     destroyed?(): void;
// }


//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class*  
 * contienen funcionalidades utilitarias para la 
 * creacion de componentes
 * ____
 */
export class Util_Components {

    /** 
     * `constructor()`  
     * 
     * ____
     */
    constructor() {}

    /** 
     * *public*  
     * descrip...
     * ____
     */
    public getHTMLelementWithId(tagTlpComp:string):HTMLElement{
        let elem_TlpComp = document.getElementById(tagTlpComp);
        
        let id_etc = this.createIdForHTMLElement(tagTlpComp);

        elem_TlpComp.setAttribute("id", id_etc);
        
        return elem_TlpComp;
    }

    /** 
     * *public*  
     * descrip...
     * ____
     */
    public getJQueryElementWithId(tagTlpComp:string):JQuery<HTMLElement>{
        let elem_TlpComp = jquery(`#${tagTlpComp}`);
        
        let id_etc = this.createIdForHTMLElement(tagTlpComp);

        elem_TlpComp.attr("id", id_etc);
        
        return elem_TlpComp;
    }

    /** 
     * *public*  
     * 
     * ____
     * *Params:*  
     * `prefixed:` : un prefijo para el id (normalmente 
     * el tag que representa al componente)
     * ____
     */
    public createIdForHTMLElement(prefixed:string):string{
        let id_element = v4();
        id_element = id_element.replace(/-/g, ""); //quitar guiones
        id_element = `${prefixed}-${id_element}`;        
        return id_element;
    }

    /** 
     * *public*  
     * clonacion de objetos JSON o Arrays de JSONs a diferentes 
     * niveles de profundidad
     * 
     * **IMPORTANTE:**  
     * No debe ser un objeto con muchos noveles (No muy profundo) por 
     * que crashea el stack
     * 
     * *Params:*  
     * `Obj` : el objeto a clonar, tiene un T que se asume 
     * implicitamente al enviar el parametro 
     * ____
     */
    public clonarObj<T>(Obj:T):T{

        let dataCopia:any;

        if (typeof(Obj) == "object" || Array.isArray(Obj)) {
            if (Array.isArray(Obj)) {
                dataCopia = [];
                for (let i = 0; i < Obj.length; i++) {
                    dataCopia[i] = this.clonarObj(Obj[i]);
                }
            }else{
                dataCopia = {};
                for (const key in Obj) {
                    if (typeof(Obj[key]) == "object" || Array.isArray(Obj[key])) {
                        dataCopia[key] = this.clonarObj(Obj[key]);
                    }else{
                        dataCopia[key] = Obj[key];
                    }
                }
            }
        } else {
            dataCopia = Obj;
        }
        return dataCopia as T;
    }    

    /** 
     * *public*  
     * convierte un string a un formato de *case* usado en 
     * programacion para nombrar variables, metodos, 
     * clases, interfaces u objetos
     * 
     * *Param:*  
     * `strBase` : el string a modificar.  
     * `caseType` : el tipo de case a convertir.  
     * ____
     */
    public convertStringToDiffCase(strBase:string, caseType:"Snake" | "Kebab" | "Camel" | "Pascal"):string{
        
        if(!strBase || strBase == null || strBase == "" || typeof strBase != "string"){
            return strBase;
        }

        switch (caseType) {
            //convertir a snakeCase
            case "Snake":
                return strBase
                        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) 
                        .map((x) => x.toLocaleLowerCase())
                        .join("_");
                break;

            case "Kebab":
                return strBase
                        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
                        .map((x) => x.toLocaleLowerCase())
                        .join("-");
                break;                

            case "Camel":
                return strBase
                        .toLocaleLowerCase()
                        .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr:string) => chr.toUpperCase());
                break;

            case "Pascal":
                return strBase
                    .replace(/\w\S*/g, (m) => `${m.charAt(0).toLocaleUpperCase()}${m.substr(1).toLocaleLowerCase()}`);
                break;

            default:
                return strBase;
                break;
        }
        
    }

}
