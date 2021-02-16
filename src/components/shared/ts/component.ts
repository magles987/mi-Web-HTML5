import Vue from 'vue'
import { CombinedVueInstance } from 'vue/types/vue';

import { Util_Components } from "./util-comp";

import jquery from "jquery";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *abstract class* 
 * factoriza los recursos necesarios que tienen en comun 
 * todas las clases que configuran componente VUEjs y 
 * administran la renderizacion de vistas  
 * ____
 * *Types:*  
 * `TPropsForComponent`  : estructura (*class*) que contiene 
 * propiedades usadas para el componente que hereda de 
 * esta clase  
 * ____
 */
export abstract class Component<TPropsForComponent>{
    
    /** ``  
     * contendrá una copia (o clon si se desea) de la 
     * propiedad `prop` recibidas desde el componente 
     * padre, para ser usada dentro de esta 
     * instancia de dataComponent
     * ____
     */
    private _inject_props: TPropsForComponent;
    /**Determina si la propiedad `prop` recibida 
     * desde el renderizador de VUEjs debe ser 
     * copiada como referencia o debe ser clonada.  
     * predefinido para copiar referencia
     */
    protected isInjectPropsClonated:boolean; 

    /** almacenará elemento raiz del componente 
     * (el que envuelve todo el componente) para 
     * usarlo como referencia o elemento relativo.  
     * *element HTML*
     */
    public HTML_rootElemComponent:HTMLElement;
    /** almacenará elemento raiz del componente 
     * (el que envuelve todo el componente) para 
     * usarlo como referencia o elemento relativo.  
     * *element JQuery*
     */
    public JQ_rootElemComponent:JQuery<HTMLElement>;

    /** Utilidades de los componentes */
    public util_comp:Util_Components;

    /** 
     * `constructor()`  
     * 
     * *Param:*  
     * `that_Vue` : *protected Property* contiene 
     * un contexto this de la instancia actual 
     * del componente
     * ____
     */
    constructor(
        protected that_Vue:CombinedVueInstance <Vue, unknown, unknown, unknown, Readonly<Record<string, any>>>,
    ){
        this.util_comp = new Util_Components();

        //predefinidamente el objeto prop recibido NO se clona
        this.isInjectPropsClonated = false;
    }

    //================================================================
    /** 
     * *public*  
     * permite seleccionar y preconfigurar el contenedor html raiz 
     * para este componente, se usa para mantener listo el elemento 
     * como referencia relativa en un alcance de nivel de componente 
     * ____
     */
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
    public get inject_props(): TPropsForComponent {
        return this._inject_props;
    }
    public set inject_props(prop: TPropsForComponent) {
        this._inject_props = (this.isInjectPropsClonated) ? 
                                this.util_comp.clonarObj(prop) : prop;         
    }
    
}
