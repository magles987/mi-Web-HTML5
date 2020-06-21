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
/*class Util_Components*/
//contienen funcionalidades utilitarias para la creacion de componentes
export class Util_Components {

    constructor() {}
    /*getHTMLelementWithId()*/
    //
    //Parametros:
    //
    public getHTMLelementWithId(tagTlpComp:string):HTMLElement{
        let elem_TlpComp = document.getElementById(tagTlpComp);
        
        let id_etc = this.createIdForHTMLElement(tagTlpComp);

        elem_TlpComp.setAttribute("id", id_etc);
        
        return elem_TlpComp;
    }

    /*getJQueryElementWithId()*/
    //
    //Parametros:
    //
    public getJQueryElementWithId(tagTlpComp:string):JQuery<HTMLElement>{
        let elem_TlpComp = jquery(`#${tagTlpComp}`);
        
        let id_etc = this.createIdForHTMLElement(tagTlpComp);

        elem_TlpComp.attr("id", id_etc);
        
        return elem_TlpComp;
    }

    /*createIdForHTMLElement()*/
    //
    //Parametros:
    //prefixed: un prefijo para el id
    public createIdForHTMLElement(prefixed:string):string{
        let id_element = v4();
        id_element = id_element.replace(/-/g, ""); //quitar guiones
        id_element = `${prefixed}-${id_element}`;        
        return id_element;
    }

    /*copiarData()*/
    //clonacion de objetos JSON a  diferentes niveles de profundidad
    //CUIDADO CON EL STACK, NO PUEDE SER MUY PROFUNDO
    //Parametros:
    //data recibe un objeto de tipo  T (que se debe tipar al llamar 
    //a este metodo) el cual puede ser objeto o array
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

    /*convertStringToDiffCase()*/
    //convierte un string a un tipo de case usado en programacion para 
    //nombrar variables, metodos, clases, interfaces u objetos
    //Argumentos:
    //strBase: el string a modificar
    //caseType: el tipo de case a convertir
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
