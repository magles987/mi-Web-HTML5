import Vue from 'vue'
import { CombinedVueInstance } from 'vue/types/vue';

import { Component } from '../shared/ts/component';
import { Util_Components } from "../shared/ts/util-comp";

import jquery from "jquery";

//================================================================
// importaciones de HTML y CSS (el HTML se debe importar con require)
import "./header-c.scss";
/**Contiene el template ya requerido desde el archivo HTML */
var html_template = require("./header-c.html");
/**
 * nombre referencial en estilo *KebabCase* para nombrar 
 * al componente; asi tambien se debe llamar los archivos 
 * referentes a este componente y su representacion 
 * en HTML y CSS
 */
var tag_component = "header-c";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class* 
 * declara la estructura de propiedades `props` a 
 * usar en este componente.  
 */
class PropsForComponent {

    //aqui las propiedades del objeto props a recibir 

}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class*  
 * adminstra todo lo referente a la configuracion del 
 * componente y renderizacion de vista
 * 
 * *Component* `HeaderComponent`  
 * componente prueba de un body test
 * ____
 * *extends:*  
 * `Component`  
 * ____
 */
export class HeaderComponent extends Component<PropsForComponent>{

    public campo1:string;

    /** 
     * `constructor()`  
     * 
     * *Param:*  
     * `that_Vue` : contiene un contexto this de la 
     * instancia actual del componente, es necesario 
     * para diferenciar cuando se renderizan varios 
     * componentes de un mismo tipo, ya que la instancia 
     * se crea durante la renderizacion
     * ____
     */
    constructor(
        that_Vue:CombinedVueInstance <Vue, unknown, unknown, unknown, Readonly<Record<string, any>>>
    ) {
        super(that_Vue);

        //asignar "inyectar" el objeto prop recibido de la instancia del vueComponent
        this.isInjectPropsClonated = false; //determina si se desea que el objeto se clone
        this.inject_props = this.that_Vue.$props[HeaderComponent.nomProps] || new PropsForComponent();

        //---test-----
        this.campo1 = "Titulo desde comp vue";
        setTimeout(() => {
            this.campo1 = "Algo totalmente diferente";
        }, 10000);
        //----------
    }

    //================================================================


    //================================================================
    /**estaticos de metadata para ser usado en otros componentes 
     * (mas usados en componente padre de este componente)*/

    /** **static**  
     * etiqueta (en formato *KebabCase*) que identifica al componente 
     */
    public static tag_component = tag_component;
    /** **static**  
     * nombre del objeto (en formato *Camelcase*) que contiene
     * las `props` propiedades externas del componente  
     * (que hacen las veces de @input de angular pero en VUEjs)
     */
    public static nomProps = new Util_Components().convertStringToDiffCase(HeaderComponent.tag_component, "Camel");
    /** **static**  
     * Obtiene una instancia vacia de la estructura de props 
     * para este componente.  
     * Se realiza por medio de este metodo estatico para no 
     * tener que esportar la estructura, ya que el nombre con 
     * que se declara la estructura (de tipo *class*) tiene el 
     * mismo nombre para todos los componentes
     */
    public static getPropsForComponent = ()=> new PropsForComponent();
    
    /** 
     * *public static*  
     * retorna el *builder* de componente que se usará 
     * para el import para renderizar el componente en 
     * el padre.
     * 
     * Este *builder* contiene toda la configuracion requerida
     * para renderizar el componente (*templates html+css*, 
     * *data* (que es la clase que maneja los datos del 
     * componente), los *hooks* del componente, las *props* y 
     * demas configuraciones)
     * 
     * *Param:*  
     * `isSingleton` determina si se quieren instancias singleton 
     * de este componente, es util si se garantiza que solo 
     * existe un componente de este tipo en cada vista, pero si
     * se usan varios componentes de este tipo es mejor No 
     * usar singleton  
     * ____
     */
    public static getVueComponent(isSingleton=false){

        //contenedor si de piensa usar de forma singleton
        let stg_data_comp:HeaderComponent;

        return Vue.extend({
            //cargar plantilla html
            template:html_template,//require("./xxxcomponentxxx.html"),
            
            //cargar la instancia que controlará al componente
            data : function() {
                
                let data_comp:HeaderComponent;
                //determinar la forma de instanciacion de data
                if (isSingleton == false) {
                    //cada elemento componente tendra su propia instancia data
                    data_comp = new HeaderComponent(this); 
                } else {
                    //cada elemento componente tendra la misma instancia data
                    if (!stg_data_comp || stg_data_comp == null) {
                        stg_data_comp = new HeaderComponent(this);
                    }
                    data_comp = stg_data_comp;
                }
                       
                return data_comp;
            },
            //declarar el nombre de la propiedad que recibe el objeto props
            //no permite el tipado a Component:propComponent por eso se 
            //usa solo en nombre de la propiedad
            props:[HeaderComponent.nomProps],
            
            //algunos hooks pertenecientes al ciclo 
            //de vida del componente (IMPORTANTE: no estan todos)
            //
            //se debe asignar contextos como that, recordar que las instancias de Vuejs son 
            //un super objeto que contiene en sus propiedades la $data y 
            //las $props, cuando se ejecuta funciones de nivel de instancia 
            //como los hooks se puede recolectar la informacion de la intancia que los esta 
            //llamando a traves de realizar contextos de this a that

            //cuando se a creado en memoria el componente
            created : function() {
                const that = <CombinedVueInstance <Vue, unknown, unknown, unknown, Readonly<Record<string, any>>>><unknown>this;
                const context_data = <HeaderComponent>that.$data;
                return;
            },
            //cuando se a montado el HTML y CSS del componente
            mounted : function(){
                const that = <CombinedVueInstance <Vue, unknown, unknown, unknown, Readonly<Record<string, any>>>><unknown>this;
                const context_data = <HeaderComponent>that.$data;
                
                //configurar el elemento root del componente
                context_data.configHTMLRootElemnt(<HTMLElement>that.$el, HeaderComponent.tag_component);
                
                return;
            },
            //actualizacion ??? del componente
            updated : function() {
                const that = <CombinedVueInstance <Vue, unknown, unknown, unknown, Readonly<Record<string, any>>>><unknown>this;
                const context_data = <HeaderComponent>that.$data;
                return;
            },
            //cuando el componente deja de existir, 
            //tanto en HTML como en memoria            
            destroyed : function() {
                const that = <CombinedVueInstance <Vue, unknown, unknown, unknown, Readonly<Record<string, any>>>><unknown>this;
                const context_data = <HeaderComponent>that.$data;
                return;
            },

            //los subcomponentes a usar
            components: {
                //..aqui los subcomponentes
                //"comp-c" :  ()=> <any>import('./components/comp/comp').then(ts_Comp=>ts_Comp.CompComponent.getVueComponent())
            }
        });    
    }
}
