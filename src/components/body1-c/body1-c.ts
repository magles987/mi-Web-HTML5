import Vue from 'vue'
import { CombinedVueInstance } from 'vue/types/vue';

import { Component } from '../shared/ts/component';
import { Util_Components } from "../shared/ts/util-comp";

import { Producto } from '../../MC-firebase/models/producto/producto-m';
import { ProductoController } from '../../MC-firebase/controllers/producto/producto-ctrl';
import { IProductoFilter } from '../../MC-firebase/controllers/producto/producto-filter-handler';

import jquery from "jquery";

//================================================================
// importaciones de HTML y CSS (el HTML se debe importar con require)
import "./body1-c.scss";
import { IProductoHookParams } from '../../MC-firebase/controllers/producto/producto-hook-handler';
import { Fb_Paginator } from '../../MC-firebase/controllers/fb-paginator';
import { ProductoRelationshipHandler } from '../../MC-firebase/controllers/producto/producto-relationship-handler';
import { ProductoMeta } from '../../MC-firebase/controllers/producto/producto-meta';

/**Contiene el template ya requerido desde el archivo HTML */
var html_template = require("./body1-c.html");
/**
 * nombre referencial en estilo *KebabCase* para nombrar 
 * al componente; asi tambien se debe llamar los archivos 
 * referentes a este componente y su representacion 
 * en HTML y CSS
 */
var tag_component = "body1-c";

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
 * *Component* `Body1Component`  
 * componente prueba de un body test
 * ____
 * *extends:*  
 * `Component`  
 * ____
 */
export class Body1Component extends Component<PropsForComponent>{

    public campo1:string;

    private mCtrl:ProductoController;
    private mMeta:ProductoMeta;
    public mFilter:IProductoFilter;
    public mHookP:IProductoHookParams;
    private mPaginator:Fb_Paginator;
    private mRelationHandler:ProductoRelationshipHandler;

    public listProductos:Producto[];
    public list_FK_PrubaProd:Producto[];


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
        this.inject_props = this.that_Vue.$props[Body1Component.nomProps] || new PropsForComponent();

        //---test-----
        this.campo1 = "Body1";

        this.mCtrl = ProductoController.getInstance();
        this.mMeta = this.mCtrl.getModelMeta();
        this.mFilter = this.mCtrl.getDefFilterInstance();
        this.mHookP = this.mCtrl.getDefHookParamsInstance();
        this.mPaginator = this.mCtrl.getModelPaginator();
        this.mRelationHandler = this.mCtrl.getModelPopulator();

        this.listProductos = [];
        this.list_FK_PrubaProd = [];

//this.mCtrl.createDocsTest();
        this.startPage();
        //----------
    }

    //================================================================
    public clickeando():void{
        console.log("clickeando");
    }    

    public startPage():void{

        this.mFilter.directionPaginate = "initial";

        this.mCtrl.getAllDocs(this.mFilter, this.mHookP)
        .then((docs) => {
            docs = (Array.isArray(docs)) ? docs : [docs];
            console.log(docs);
            this.listProductos = docs;

            //this.start_FK_Page(); 



            this.mCtrl.update(this.listProductos[0], this.mHookP)
            .then(() => {
                console.log(`todo bene`);
            })            


            // const testField = {
            //     _id:"171e0ce6925-907198e3c1f87abe",
            //     _pathDoc:"Productos/171e0ce6925-907198e3c1f87abe",
            //     nombre:"holasss"
            // };

            // this.mRelationHandler.modifyReference("update", testField)
            // .then(() => {
            //     console.log(`todo bene`);
            // })
            // .catch((error)=>{ console.log(error)});

            // const testField = this.listProductos[0];

            // this.mRelationHandler.setCloneReference(testField, this.mMeta.fk_refTest.nom)
            // .then(() => {
            //     console.log(`todo bene`);
            // })
            // .catch((error)=>{ console.log(error)});

        
        })

    }

    public previousPage():void{

        this.mFilter.directionPaginate = "previous";

        this.mCtrl.getAllDocs(this.mFilter, this.mHookP)
            .then((docs) => {
                docs = (Array.isArray(docs)) ? docs : [docs];
                console.log(docs);
                this.listProductos = docs;
            });
    }

    public nextPage():void{

        this.mFilter.directionPaginate = "next";

        this.mCtrl.getAllDocs(this.mFilter, this.mHookP)
            .then((docs) => {
                docs = (Array.isArray(docs)) ? docs : [docs];
                console.log(docs);
                this.listProductos = docs;
            });

    }

    public start_FK_Page():void{

        if (Array.isArray(this.listProductos) == false || this.listProductos.length <= 0 ) {
            return;
        }

        let doc0 = this.listProductos[0];
        
        const fMeta = this.mMeta.fk_PruebaProd;
        let fCtrl = this.mRelationHandler.getInputCtrlByNomModel(fMeta.nom);
        let fPFilter = fCtrl.getDefPopulationFilterInstance();
        let fHookP = fCtrl.getDefHookParamsInstance();
        let fpPaginator = this.mRelationHandler.getPopulatePaginator();

        fPFilter.isPopulate = true;
        fPFilter.directionPaginate = "initial";

        this.mRelationHandler.populateField(doc0.fk_PruebaProd, this.mMeta.fk_PruebaProd.nom, fPFilter, fHookP)
        .then((fks:Producto[])=>{
            fks = (Array.isArray(fks)) ? fks : [fks];;
            this.list_FK_PrubaProd = fks;
        })
    }

    
    public previous_FK_Page():void{

        if (Array.isArray(this.listProductos) == false || this.listProductos.length <= 0 ) {
            return;
        }

        let doc0 = this.listProductos[0];

        const fMeta = this.mMeta.fk_PruebaProd;
        let fCtrl = this.mRelationHandler.getInputCtrlByNomModel(fMeta.nom);
        let fPFilter = fCtrl.getDefPopulationFilterInstance();
        let fHookP = fCtrl.getDefHookParamsInstance();
        let fpPaginator = this.mRelationHandler.getPopulatePaginator();

        fPFilter.isPopulate = true;
        fPFilter.directionPaginate = "previous";
        fPFilter.limit = 2;

        this.mRelationHandler.populateField(doc0.fk_PruebaProd, this.mMeta.fk_PruebaProd.nom, fPFilter, fHookP)
        .then((fks:Producto[])=>{
            fks = (Array.isArray(fks)) ? fks : [fks];;
            this.list_FK_PrubaProd = fks;
        })
    }

    public next_FK_Page():void{
        
        if (Array.isArray(this.listProductos) == false || this.listProductos.length <= 0 ) {
            return;
        }        

        let doc0 = this.listProductos[0];

        const fMeta = this.mMeta.fk_PruebaProd;
        let fCtrl = this.mRelationHandler.getInputCtrlByNomModel(fMeta.nom);
        let fPFilter = fCtrl.getDefPopulationFilterInstance();
        let fHookP = fCtrl.getDefHookParamsInstance();
        let fpPaginator = this.mRelationHandler.getPopulatePaginator();

        fPFilter.isPopulate = true;
        fPFilter.directionPaginate = "next";

        this.mRelationHandler.populateField(doc0.fk_PruebaProd, this.mMeta.fk_PruebaProd.nom, fPFilter, fHookP)
        .then((fks:Producto[])=>{
            fks = (Array.isArray(fks)) ? fks : [fks];;
            this.list_FK_PrubaProd = fks;
        })

    }    

    //================================================================
    /**estaticos de metadata para ser usado en otros componentes 
     * (mas usados en componente padre de este componente)*/

    /** *static*  
     * etiqueta (en formato *KebabCase*) que identifica al componente 
     */
    public static tag_component = tag_component;
    /** *static*  
     * nombre del objeto (en formato *Camelcase*) que contiene
     * las `props` propiedades externas del componente  
     * (que hacen las veces de @input de angular pero en VUEjs)
     */
    public static nomProps = new Util_Components().convertStringToDiffCase(Body1Component.tag_component, "Camel");
    
    /** *static*  
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

        /**contenedor de unica instancia si se usa 
         * singleton para el componente*/
        let stg_data_comp:Body1Component;

        return Vue.extend({
            /**cargar plantilla html*/
            template:html_template,
            
            /**cargar la instancia que controlará al componente*/
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
            /** declarar el nombre de la propiedad que recibe el objeto 
             * propsno permite el tipado a Component:propComponent 
             * por eso se usa solo en nombre de la propiedad
             */
            props:[Body1Component.nomProps],
            
            //================================================================
            /**algunos hooks pertenecientes al ciclo de vida del componente  
             * **IMPORTANTE:** no estan todos
             * Se debe asignar contextos como that, recordar que las instancias
             * de Vuejs son un super objeto que contiene en sus propiedades la 
             * $data y las $props, cuando se ejecuta funciones de nivel de 
             * instancia como los hooks se puede recolectar la informacion 
             * de la intancia que los esta llamando a traves de realizar 
             * contextos de this a that
             */

            /**cuando se a creado en memoria el componente*/
            created : function() {
                const that = <CombinedVueInstance <Vue, unknown, unknown, unknown, Readonly<Record<string, any>>>><unknown>this;
                const context_data = <Body1Component>that.$data;
                return;
            },
            /**cuando se a montado el HTML y CSS del componente*/
            mounted : function(){
                const that = <CombinedVueInstance <Vue, unknown, unknown, unknown, Readonly<Record<string, any>>>><unknown>this;
                const context_data = <Body1Component>that.$data;
                
                //configurar el elemento root del componente
                context_data.configHTMLRootElemnt(<HTMLElement>that.$el, Body1Component.tag_component);
                
                return;
            },
            /**actualizacion ??? del componente*/
            updated : function() {
                const that = <CombinedVueInstance <Vue, unknown, unknown, unknown, Readonly<Record<string, any>>>><unknown>this;
                const context_data = <Body1Component>that.$data;
                return;
            },
            /**cuando el componente deja de existir, tanto en HTML como en memoria*/            
            destroyed : function() {
                const that = <CombinedVueInstance <Vue, unknown, unknown, unknown, Readonly<Record<string, any>>>><unknown>this;
                const context_data = <Body1Component>that.$data;
                return;
            },

            /**los subcomponentes a usar*/
            components: {
                //..aqui los subcomponentes
                //"comp-c" :  ()=> <any>import('./components/comp/comp').then(ts_Comp=>ts_Comp.CompComponent.getVueComponent())
            }            
        });    
    }
}


