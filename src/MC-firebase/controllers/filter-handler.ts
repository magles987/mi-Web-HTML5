//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *interface* `IFilter`
 * factoriza las propiedadesde del prototipo 
 * para un objeto de filtrado por cada modelo
 * ____
 */
export interface IFilter<TIModel_forOrder> {
    /**Limite de documentos a leer por Query */
    limit : number;
    /**Ruta base para documentos embebidos (de 
     * subcolecciones) */
    _pathBase : string; 
    /**Flag, determina si se quiere realizar una 
     * consulta agrupada para subcolecciones en 
     * Firestore (exclusivo para Firestore)*/
    isCollectionGroup : boolean;
    /**Configuracion para ordenar los documentos 
     * recibidos, esta tipada con la interfaz 
     * de cada modelo asi: `IModel<"asc"|"desc">` 
     * donde `"asc"` y `"desc"` indican el ordenamiento
     * de cada campo
     * */
    order:TIModel_forOrder;

    /**Determina las opciones de paginacion:  
     * `"initial"` : Query con el inicio de la paginacion 
     * (se puede dar cuando se realiza una nueva Query 
     * con valores de filtrado diferentes).  
     * `"previous"` : anterior pagina (grupo o lote) de 
     * documentos a leer.  
     * `"next"` : siguiente pagina (grupo o lote) de 
     * documentos a leer.  
     */
    directionPaginate: "initial" | "previous" | "next";

    /**(no utilizado en Firestore) A futuro permitiria 
     * seleccionar un numero de pagina especifico y dirigirse a ella */
    targetPage:number | null;  

}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *interface*
 * factoriza las propiedades a implementar para los filtros 
 * especiales de poblar como la flag *_isPopulate* 
 * y los filtros de query para modelos externos.  
 * **IMPORTANTE** 
 * estos filtros de modelos externos se deben declarar 
 * en las interfaces que hereden esta interfaz correspondiente
 *  a cada *IModelPopulateFilter*
 * ____
 */
export interface IPopulationFilter<TIModel> {
    /**Flag que determina si se desea **analizar** que campos  
     * especiales con prefijo *emb_* o *fk_* **posiblemente** 
     * se puedan poblar, para ahorrar recursos en analisis 
     * no utiles
    */
    isPopulate: boolean;

    /**
     * limite de referencias a poblar
    */
    limit: number;

    /**
     * direccion de paginacion 
     * `"initial"` : permite seleccionar el grupo de referencias 
     * (*_pahtDoc* o *_id*) con el que inicia la paginacion.  
     * `"previous"` : permite seleccionar el grupo de referencias 
     * (*_pahtDoc* o *_id*) anterior.  
     * `"next"` : permite seleccionar el grupo de referencias 
     * (*_pahtDoc* o *_id*) siguiente.   
    */
    directionPaginate: "initial" | "previous" | "next";

    /**(no utilizado en Firestore) A futuro permitiria 
     * seleccionar un numero de pagina especifico y dirigirse a ella */
    targetPage:number | null;  

    /**contiene el tamanno de referencias a poblar */
    populateSize:number;
}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *abstract class*  
 * factoriza el manejador de filtrado usado en cada 
 * modelo, se encarga de reiniciar los prototipos 
 * de objetos *modelFilter* y demas factorizacion 
 * propiedades auxiliares y metodos que se requieran
 * para cualquier consulta a Firestore
 * ____
 */
export abstract class FilterHandlerCtrl<TIModel> {

    /** *protected abstract*  
     * Extracto de prototipo de un modelFilter para 
     * inicializarlo internamente con los valores 
     * predefinidos que han sido factorizados, su 
     * inicializacion se **debe** hacer por medio 
     * del metodo startDefault en cada una de las 
     * clases hijas, se maneja de este modo para 
     * permitir el tipado y la inclucion de propiedades 
     * personalizadas en las interfaces hijas
     * ____
     */
    protected abstract defaultModelFilter:IFilter<TIModel>;

    /** *protected abstract*  
     * Extracto de prototipo de un modelPopulationFilter
     *  para inicializarlo internamente con los valores 
     * predefinidos que han sido factorizados, su 
     * inicializacion se **debe** hacer por medio 
     * del metodo `startDefault` en cada una de las 
     * clases hijas, se maneja de este modo para 
     * permitir el tipado y la inclucion de propiedades 
     * personalizadas en las interfaces hijas
     * ____
     */
    protected abstract defaultModelPopulationFilter:IPopulationFilter<TIModel>;


    /** 
     * `constructor()`  
     * configura los valores predefinidos 
     * ____
     */    
    constructor() {

    }

    /** 
     * *protected*  
     * Inicializa las propiedades factorizadas por 
     * default, devuelve un *Extracto* del objeto 
     * *defaultModelFilter* , ya que este pude tener 
     * propiedades personalizadas en la clase 
     * extendida de esta
     * ____
     */
    protected startDefaultFilter():IFilter<TIModel>{
        return {
            limit : 10,
            _pathBase : "",
            order : <TIModel>{},
            isCollectionGroup : false,
            directionPaginate : "initial",
            targetPage : null,
        };
    }

    /** 
     * *protected*  
     * Inicializa las propiedades factorizadas por 
     * default, devuelve un *Extracto* del objeto 
     * *defaultModelPopulationFilter* , ya que este 
     * pude tener propiedades personalizadas en la 
     * clase extendida de esta.
     * ____
     */    
    protected startDefaultPopulationFilter():IPopulationFilter<TIModel>{
        return {
            isPopulate:false,
            limit:5,
            directionPaginate:"initial",
            populateSize : 0, // se debe asignar
            targetPage : null,
        };
    }    

    /** 
     * *public abstract*  
     * obtiene una instancia del prototipo de *modelFilter*,
     * No referencial (un clon).  
     * se realiza asi ya que cada *model* puede tener su 
     * propia configuracion de filtrado y a su vez cada 
     * *Query* del *model* puede tener un filtro personalizado  
     */
    public abstract getFilterPrototype():IFilter<TIModel>;

    /** 
     * *public abstract*  
     * obtiene una instancia del prototipo de *modelPopulationFilter*,
     * No referencial (un clon).  
     * se realiza asi ya que cada *model* puede tener su 
     * propia configuracion de filtrado y a su vez cada 
     * *Query* del *model* puede tener un filtro personalizado  
     */
    public abstract getPopulationFilterPrototype():IPopulationFilter<TIModel>;


}
