import Vue from 'vue'
import { CombinedVueInstance } from 'vue/types/vue';

import { Util_Components } from "./util-comp";

import jquery from "jquery";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*abstract class Component<>*/
//
export abstract class Component<PropsForComponent>{
    
    //contendrá una copia (o clon si se desea)
    //de la propiedad prop recibidas desde el 
    //componente padre, para ser usada dentro de 
    //esta instancia de dataComponent
    private _inject_props: PropsForComponent;
    protected isInjectPropsClonated:boolean; 

    //almacenará elemento raiz del componente 
    //(el que envuelve todo el componente)
    //para usarlos como referencia o elemento relativo
    public HTML_rootElemComponent:HTMLElement;
    public JQ_rootElemComponent:JQuery<HTMLElement>;

    //utilidades del componente
    public util_comp:Util_Components;

    constructor(
        //contiene un contexto this de la 
        //instancia actual del componente
        protected that_Vue:CombinedVueInstance <Vue, unknown, unknown, unknown, Readonly<Record<string, any>>>,

    ){
        this.util_comp = new Util_Components();

        //predefinidamente el objeto prop recibido NO se clona
        this.isInjectPropsClonated = false;
    }

    //================================================================
    /*configHTMLRootElemnt()*/
    //permite seleccionar y preconfigurar el contenedor html raiz para 
    //este componente, se usara para mantener listo el elemento y 
    //usarlo como referencia relativa
    public configHTMLRootElemnt(el:HTMLElement, tag_component:string):void{
        this.HTML_rootElemComponent = el;
        //asignar un id personalizado
        let id = this.util_comp.createIdForHTMLElement(tag_component);
        this.HTML_rootElemComponent.setAttribute("id", id); 
        
        //opcional si se desea usar Jquery para recorrer el DOM
        this.JQ_rootElemComponent = jquery(`#${id}`);
    }

    //================================================================
    //getter y setter del objeto props inyectado para uso 
    //interno en la instancia
    public get inject_props(): PropsForComponent {
        return this._inject_props;
    }
    public set inject_props(v: PropsForComponent) {
        this._inject_props = (this.isInjectPropsClonated) ? 
                                this.util_comp.clonarObj(v) : v;         
    }

}
