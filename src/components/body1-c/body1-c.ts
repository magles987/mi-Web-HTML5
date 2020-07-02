import Vue from 'vue'
import { CombinedVueInstance } from 'vue/types/vue';

import { Component } from '../shared/ts/component';
import { Util_Components } from "../shared/ts/util-comp";

<<<<<<< HEAD
import { ProductoController } from '../../MC-firebase/controllers/producto/producto-ctrl';

=======
>>>>>>> 05e6d3fe50914f87dd7f29e123daa3b015a848cf
import jquery from "jquery";

//================================================================
// importaciones de HTML y CSS (el HTML se debe importar con require)
import "./body1-c.scss";
<<<<<<< HEAD

=======
import { ProductoController } from '../../MC-firebase/controllers/producto/producto-ctrl';
>>>>>>> 05e6d3fe50914f87dd7f29e123daa3b015a848cf
var html_template = require("./body1-c.html");
//nombre referencial en estilo  KebabCase  para nombrar al componente
//asi tambien se debe llamar los archivos referentes a este componente 
//y su representacion en HTML y CSS
var tag_component = "body1-c";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*class PropsForComponent*/
//clase refernecial Instanciable para administras las props externas 
//a usar para este componente, aqui se deben colocar las propiedades
//que contendra el objeto prop que el componente padre pase a este hijo
class PropsForComponent {

    //aqui las propiedades del objeto props a recibir 

}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
export class Body1Component extends Component<PropsForComponent>{

    public campo1:string;

    constructor(
        //contiene un contexto this de la 
        //instancia actual del componente
        that_Vue:CombinedVueInstance <Vue, unknown, unknown, unknown, Readonly<Record<string, any>>>
    ) {
        super(that_Vue);

        //asignar "inyectar" el objeto prop recibido de la instancia del vueComponent
        this.isInjectPropsClonated = false; //determina si se desea que el objeto se clone
        this.inject_props = this.that_Vue.$props[Body1Component.nomProps] || new PropsForComponent();

        //---test-----
<<<<<<< HEAD
        this.campo1 = "Body1";
        let pc = new ProductoController();
        pc.getAllDocs()
        .then((docs) => {
            console.log(docs);
        })
=======
        this.campo1 = "Body1";   

        let p_metaa = new ProductoController();
>>>>>>> 05e6d3fe50914f87dd7f29e123daa3b015a848cf
        //----------
    }

    //================================================================
    public clickeando():void{
        console.log("clickeando");
    }    

    //================================================================
    //estaticos de metadata para ser usado en otros componentes 
    //(mas usados en componente padre de este componente)
    public static tag_component = tag_component;
    public static nomProps = new Util_Components().convertStringToDiffCase(Body1Component.tag_component, "Camel");
    public static getPropsForComponent = ()=> new PropsForComponent();
    
    /*getVueComponent()*/
    //retorna el constructor de componente que se usará para el import
    //para renderizar el componente en el padre 
    public static getVueComponent(isSingleton=false){

        //contenedor si de piensa usar de forma singleton
        let stg_data_comp:Body1Component;

        return Vue.extend({
            //cargar plantilla html
            template:html_template,//require("./xxxcomponentxxx.html"),
            
            //cargar la instancia que controlará al componente
            data : function() {
                
                let data_comp:Body1Component;
                //determinar la forma de instanciacion de data
                if (isSingleton == false) {
                    //cada elemento componente tendra su propia instancia data
                    data_comp = new Body1Component(this); 
                } else {
                    //cada elemento componente tendra la misma instancia data
                    if (!stg_data_comp || stg_data_comp == null) {
                        stg_data_comp = new Body1Component(this);
                    }
                    data_comp = stg_data_comp;
                }
                       
                return data_comp;
            },
            //declarar el nombre de la propiedad que recibe el objeto props
            //no permite el tipado a Component:propComponent por eso se 
            //usa solo en nombre de la propiedad
            props:[Body1Component.nomProps],
            
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
                const context_data = <Body1Component>that.$data;
                return;
            },
            //cuando se a montado el HTML y CSS del componente
            mounted : function(){
                const that = <CombinedVueInstance <Vue, unknown, unknown, unknown, Readonly<Record<string, any>>>><unknown>this;
                const context_data = <Body1Component>that.$data;
                
                //configurar el elemento root del componente
                context_data.configHTMLRootElemnt(<HTMLElement>that.$el, Body1Component.tag_component);
                
                return;
            },
            //actualizacion ??? del componente
            updated : function() {
                const that = <CombinedVueInstance <Vue, unknown, unknown, unknown, Readonly<Record<string, any>>>><unknown>this;
                const context_data = <Body1Component>that.$data;
                return;
            },
            //cuando el componente deja de existir, 
            //tanto en HTML como en memoria            
            destroyed : function() {
                const that = <CombinedVueInstance <Vue, unknown, unknown, unknown, Readonly<Record<string, any>>>><unknown>this;
                const context_data = <Body1Component>that.$data;
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


