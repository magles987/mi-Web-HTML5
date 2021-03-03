import { IFilter, IPopulationFilter } from "./filter-handler";
import { UtilControllers } from "./util-ctrl";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class*  
 * encargada de lo referente a la paginacion de documentos 
 * recibidos desde Firestore, administra tanto la paginacion 
 * estandar de colecciones y subcolecciones (embebidas) como 
 * la paginacion del poblar por medio de referencia.
 * 
 * por ahora la paginacion esta diseñada para lectura de 
 * documentos no en tiempo real, por lo tanto es posible 
 * que para actualizar el estado de los documentos (dependiendo 
 * de  *typePagination*) pueda generarse exceso de sobrelecturas 
 * especialmente en la pagina inicial y en la pagina final
 * ____
 */
export class Fb_Paginator {

    /**Contine un backUp de los **snapShotsDocs** leidos, 
     * en el tipo "classic" solo almacena el lote actual, 
     * en los demas tipos acumula los lotes anteriores
     *  y el actual
     */
    private bufferSSDocsGetted:firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>[]

    /**Permite determinar que ya no se 
     * leyeron mas docs en la direccion "next"  */
    private isLimitNext:boolean;
    /**Permite determinar que ya no se 
     * leyeron mas docs en la direccion "previous" */
    private isLimitPrevious:boolean;

    /** 
     * contiene un backUp de los documentos leidos 
     * en modo populate, en tipo "classic" solo 
     * almacena el lote actuual.  
     * **NO** son snapshotsDocs
     * ____
     */
    private bufferPopulateDocGetted: any[];

    /**
     * se encarga de llevar la pagina 
     * actual en la paginacion del poblado
     */    
    private currentPopulatePage:number;
    
    /**contiene utilidades esclusivas para los controllers */
    private util_ctrl:UtilControllers;

    /**
     * `constructor()`
     * contruye el paginador por default el tipo 
     * de pagination es *classic*
     *
     * *Params*
     * `typePagination` : determina el tipo
     * de paginacion deseada para este modelCtrl.  
     * **classic** : permite mostrar los documentos
     * de la pagina actual con opcion de paginacion
     * *previous* y *next* .  
     * **AcumulativeSimple** : permite acumular todos los
     * documentos leidos hasta el momento (de la
     * misma Query) e ir concatenando las nuevas
     * paginas de documentos, la opcion de paginacion 
     * *next* agrega al acumulado por paginas o lotes, 
     * la opcion de paginacion *previous* devuelve los 
     * documentos de la pagina incial.  
     * `AcumulativeStrong` : **PRECAUCION** esta opcion
     * pagina los resultados en **un solo lote** con lo
     * cual cada vez que se desee leer una nueva 
     * pagina de documentos tambien leerá los documentos 
     * de las paginas leidas priviamente leidas que puede 
     * generar una cantidad exponencial de lecturas, se 
     * usan las opciones de paginacion *next* para solicitar 
     * los demas documentos y *previous* para reiniciar 
     * el lote
     * ____
    */
    constructor(
        /**
         * *public*  
         * determina el tipo de paginacion deseada 
         * para este modelCtrl
         * `classic` : permite mostrar los documentos 
         * de la pagina actual con opcion de paginacion 
         * *previous* y *next* clasica y estatica (al llegar 
         * al limite (next o previous) NO  se actualizan el 
         * ultimo lote para ahorrar  lecturas) . 
         * `classic-Acumulative`  : permite paginar de forma 
         * clasica pero entregando virtualmente Docs Acumulados, 
         * con la opcion de actualizar los docs del lote limite 
         * (ya sea en direccion next o previous) en forma de 
         * toggle (consume mas lecturas)
         * `AcumulativeSimple` : permite acumular todos los 
         * documentos leidos hasta el momento (de la
         * misma Query) e ir concatenando las nuevas
         * paginas de documentos, la opcion de paginacion 
         * *next* agrega al acumulado por paginas o lotes, 
         * la opcion de paginacion *previous* devuelve los 
         * documentos de la pagina incial. 
         * `AcumulativeStrong` : **PRECAUCION** esta opcion 
         * pagina los resultados en **un solo lote** con lo
         *  cual cada vez que se desee leer una nueva 
         * pagina de documentos tambien leerá los documentos 
         * de las paginas previamente leidas que puede 
         * generar una cantidad exponencial de lecturas, se 
         * usan las opciones de paginacion *next* para solicitar 
         * los demas documentos y *previous* para reiniciar 
         * el lote.  
         * 
         * **Importante** el comportamiento de los tipos de paginacion
         *  puede variar para populate
         */
        private _typePagination: "none" |
                                 "classic" |
                                 "classic-Acumulative" |
                                 "AccumulativeSimple" |
                                 "AccumulativeStrong" 
                                = "classic",       
    ) {        
        this.resetPaginatorData();
        this.util_ctrl = new UtilControllers();
    }

    /** 
     * getter de tipo de paginacion
     * ____
     */
    public get typePagination(): "none" |
                                "classic" |
                                "classic-Acumulative" |
                                "AccumulativeSimple" |
                                "AccumulativeStrong" {
        return this._typePagination;
    }
    /** 
     * setter de tipo de paginacion para actualizar en tiempo de ejecucion.
     * la actualizacion de esta propiedad conlleva a borrar los datos de 
     * antiguo tipo de paginacion como (snapshotsDocs, currentLimits, 
     * currenDirectionPaginatio y currentPage)
     * ____
     */    
    public set typePagination(
        type: "none" |
            "classic" |
            "classic-Acumulative" |
            "AccumulativeSimple" |
            "AccumulativeStrong") {

        this.resetPaginatorData();

        this._typePagination = type;
    }

    /** 
     * *private*  
     * reinicia el manejador de paginacion con sus 
     * correspondientes contenedores
     * ____
     */
    private resetPaginatorData():void{

        this.bufferSSDocsGetted = [];
        this.isLimitNext = false;
        this.isLimitPrevious = false;

        this.bufferPopulateDocGetted = [];
        this.currentPopulatePage = 1;

        return;
    }

    /** 
     * *public*  
     * configura parametros esenciales de limite y SnapShotDoc 
     * referencial para la paginacion para la construccion de 
     * un Query de firestore, retorna un objeto con dicha 
     * configuracion lista para implementar en la query. 
     * 
     * *Param:*  
     * `filter` : objeto con la configuracion del filtro 
     * a usar en la consulta.  
     * ____
     */
    public configParamsPaginateForQuery(        
        filter:IFilter<unknown>        
    ){

        //objeto respuesta preconfigurado
        let configRes = {
            
            limit : filter.limit,
            
            /**metodos de limite para Firestore
             * (normalmente limitToLast se usa para 
             * reversibles) */
            typeLimitMethod : "limit-method" as "limit-method" | "limitToLast-method",
            
            /**metodo de inicio de paginacion para Fir
             * none: ninguno NO SE PAGINA con ningun metodo
             * startAfter : paginacion directa excluyente
             * startAt : paginacion directa incluyente
             * endBefore : paginacion reversible excluyente
             * endAt : paginacion reversible incluyente
             */
            initialMethod : "none" as "none" |"startAfter" | "endBefore" | "endAt" | "startAt",
            
            /**contendrá el snapshotDocument base para realizar 
             * la consulta, es el punto de partida para la 
             * paginacion
             */            
            SSDForQuery : null as any
        
        };

        //utilitarias
        const SSDBuff_length = this.bufferSSDocsGetted.length;
        const isSSDBuff = SSDBuff_length > 0;
        let firstSSDBuff = null;
        let lastSSDBuff = null;   
        const modulusSSD = (this.bufferSSDocsGetted.length % filter.limit); 

        switch (this.typePagination) {
            /**no tiene paginacion ni limite para configurar, se usa el predefinido */
            case "none": 
                configRes.initialMethod = "none";               
                break;

            /**para classic se varia los metodos de referencia entre startAfter, startAt y 
             * endbefore; tambien se escoje el metodo para limitar los documentos de acuerdo 
             * a la direccion y al snapShotDoc referencial*/
            case "classic":

                if (isSSDBuff) {
                    firstSSDBuff = this.bufferSSDocsGetted[0]; 
                    lastSSDBuff =  this.bufferSSDocsGetted[SSDBuff_length -1];            
                }

                if (filter.directionPaginate == "initial") {

                    configRes.typeLimitMethod = "limit-method";
                    configRes.initialMethod = "startAfter";

                    configRes.SSDForQuery = null;
                }            

                if (filter.directionPaginate == "previous") {
                    
                    configRes.typeLimitMethod = "limitToLast-method";                    

                    configRes.initialMethod = "endBefore";
                    configRes.SSDForQuery = firstSSDBuff;                    

                }

                if (filter.directionPaginate == "next") {

                    configRes.typeLimitMethod = "limit-method";

                    configRes.initialMethod = "startAfter";
                    configRes.SSDForQuery = lastSSDBuff;
                }

                break;  

            /**para classic-Acumulative se varia los metodos de referencia entre startAfter, startAt y 
             * endbefore; tambien se escoje el metodo para limitar los documentos de acuerdo 
             * a la direccion y al snapShotDoc referencial*/
            case "classic-Acumulative":

                if (isSSDBuff) {
                    const idxF = (modulusSSD > 0) ?
                                SSDBuff_length - modulusSSD :
                                SSDBuff_length - filter.limit ;          
                    firstSSDBuff = this.bufferSSDocsGetted[idxF]; 
                    lastSSDBuff =  this.bufferSSDocsGetted[SSDBuff_length -1];  
                }  

                if (filter.directionPaginate == "initial") {

                    configRes.typeLimitMethod = "limit-method";
                    configRes.initialMethod = "startAfter";

                    configRes.SSDForQuery = null;
                }            

                if (filter.directionPaginate == "previous") {
                    
                    configRes.typeLimitMethod = "limitToLast-method"; 

                    if (this.isLimitPrevious == false) {
                        configRes.initialMethod = "endBefore";       
                        configRes.SSDForQuery = firstSSDBuff;                                 
                    }else{
                        configRes.initialMethod = "endAt";       
                        configRes.SSDForQuery = lastSSDBuff;    
                    }
           
                }

                if (filter.directionPaginate == "next") {

                    configRes.typeLimitMethod = "limit-method";

                    if (this.isLimitNext == false) {
                        configRes.initialMethod = "startAfter";       
                        configRes.SSDForQuery = lastSSDBuff;                                 
                    }else{
                        configRes.initialMethod = "startAt";       
                        configRes.SSDForQuery = firstSSDBuff;    
                    }               
                }

                break;                 

            /**para AccumulativeSimple requiere solo la direccion next y startAfter*/
            case "AccumulativeSimple": 
                
                configRes.typeLimitMethod = "limit-method";
                configRes.initialMethod = "startAfter";   
                
                if (filter.directionPaginate == "initial") {
                    configRes.SSDForQuery = null;
                }
                if (filter.directionPaginate == "previous") {
                    configRes.SSDForQuery = null;
                }
                if (filter.directionPaginate == "next") {
                    configRes.SSDForQuery = lastSSDBuff;
                }

                break;

            /**para AccumulativeStrong requiere solo la direccion 
             * next y startAfter; esta requiere recalcular el limite 
             * para que sea dinamico, relativo y acumulativo a la
             * ultima lectura*/
            case "AccumulativeStrong":
                    
                const bufferDDSLength = this.bufferSSDocsGetted.length;
                const pageRelative = Math.ceil(this.bufferSSDocsGetted.length / filter.limit);

                configRes.limit = (bufferDDSLength > 0 && 
                            filter.directionPaginate != "previous") ? 
                            (pageRelative + 1) * filter.limit :
                            filter.limit;
                
                configRes.typeLimitMethod = "limit-method"; 
                configRes.initialMethod = "startAfter";

                configRes.SSDForQuery = null;

                break;                       
        
            default:
                break;
        }

        return configRes

    }

    /** 
     * *public*  
     * gestionado como si fuese un hook post lectura, recibe el array de 
     * snapShotsDocs devuelto por firestore y procesa y ordena la paginacion 
     * entregando al final los documentos leidos sin metadata, tambien deja 
     * una copia en el buffer de los snapShotsDocs recividos
     * 
     * *Param:*  
     * `snapShotDocsGetted` : los ultimos snapShotDocs 
     * obtenidos de la ultima Consulta realizada para procesar.  
     * `filter` : el filtro usado en la ultima consulta
     * ____
     */
    public postPaginatePostQuery<TModel>(
        snapShotDocsGetted: firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>[], //any[],
        filter: IFilter<unknown>
    ):TModel[] {

        snapShotDocsGetted = (Array.isArray(snapShotDocsGetted)) ? snapShotDocsGetted : [snapShotDocsGetted];
        
        const bufferDocsSize = this.bufferSSDocsGetted.length;
        const SSD_length = snapShotDocsGetted.length;
        const isSSDocs = (SSD_length > 0);

        //los documentos recibidos ya procesados por el postPaginate
        let docRes:TModel[] = [];

        switch (this.typePagination) {

            /**Classic al llegar al limite en cualquier direccion 
             * (next o previous) esta seguira recargando los docs 
             * en busca de actualizaciones o de nuevos, pero siempre
             * mostrando los ultimos reales leidos */
            case "classic":

                if (filter.directionPaginate == "initial") {                    
                    this.resetPaginatorData();
                }

                if (filter.directionPaginate == "previous") {
                    this.isLimitPrevious = (isSSDocs == false || SSD_length < filter.limit)
                    this.isLimitNext = false;
                }

                if (filter.directionPaginate == "next") {               
                    this.isLimitPrevious = false;
                    this.isLimitNext = (isSSDocs == false || SSD_length < filter.limit);                    
                }        
                
                /**no permite que al llegar al limite (sea en next o previous) se muestre un alista vacia*/
                if (isSSDocs) {
                    this.bufferSSDocsGetted = snapShotDocsGetted;
                }
                break;                

            /**classic-Acumulative usando el buffer en caso de eliminaciones o cambios de 
             * pagina, estos pueden provocar que se dupliquen falsamente los documentos, 
             * por lo tanto se busca eliminar duplicados y recargar los cambios de los 
             * documentos que esten al limite de cualquier direccion (next o previous), 
             * IMPORTANTE: no se puede actualizar docs en paginas intermedias o que en su limite 
             * esten completos (que su tamanno sea igual a filter.limit) */
            case "classic-Acumulative":

                if (filter.directionPaginate == "initial") {
                    
                    this.resetPaginatorData();
                    this.bufferSSDocsGetted = snapShotDocsGetted;
                }

                if (filter.directionPaginate == "previous") {
                    const _id_SSDoc = snapShotDocsGetted[0].id;
                    if (isSSDocs) {
                        let initialCutB = (this.bufferSSDocsGetted.findIndex((B_SSDoc) => B_SSDoc.id == _id_SSDoc))
    
                        if(initialCutB >= 0 ){
                            this.bufferSSDocsGetted.splice(initialCutB); 
                        }                        
                    }
                                             
                    this.bufferSSDocsGetted = this.bufferSSDocsGetted.concat(snapShotDocsGetted);
                    this.bufferSSDocsGetted = this.util_ctrl.deleteDuplicateForObjArray(this.bufferSSDocsGetted, "id")
                                                              .filter((SSDoc) =>SSDoc.exists);   
                    
                    /**Al llegar al tope esta se activa la bandera en modo 
                     * toggle para que se intercale la verificacion de 
                     * nuevos docs y actualizacion del ultimo lote */
                    this.isLimitPrevious = (isSSDocs == false || SSD_length < filter.limit) ?
                                            !this.isLimitPrevious :
                                            false;
                    this.isLimitNext = false;

                }

                if (filter.directionPaginate == "next") {

                    const modulusBuff = (bufferDocsSize % filter.limit);
                    const initialCutB = (modulusBuff > 0) ?
                                            -modulusBuff :
                                            -filter.limit;
                    let extractBuffDocs = this.bufferSSDocsGetted.splice(initialCutB);
                    extractBuffDocs = extractBuffDocs.concat(snapShotDocsGetted);
                    this.bufferSSDocsGetted = this.bufferSSDocsGetted.concat(extractBuffDocs); 
                    this.bufferSSDocsGetted = this.util_ctrl.deleteDuplicateForObjArray(this.bufferSSDocsGetted, "id") //IMPORTANTE: se usa "id" y no "_id"
                                                            .filter((SSDoc) =>SSDoc.exists); 
                    
                    /**Al llegar al tope esta se activa la bandera en modo 
                     * toggle para que se intercale la verificacion de 
                     * nuevos docs y actualizacion del ultimo lote */
                    this.isLimitPrevious = false;
                    this.isLimitNext = (isSSDocs == false || SSD_length < filter.limit) ?
                                        !this.isLimitNext :
                                        false;   

                }              

                break;

            /**AcumulativeSimple concatena y elemina duplicados 
             * tomando en cuenta solo la direccion next, para 
             * previous se reinicias el acumulador */                                
            case "AccumulativeSimple":
          
                if (filter.directionPaginate == "initial" ) {
                    
                    this.resetPaginatorData();            
                }
               
                if (filter.directionPaginate == "previous") {
                    
                    this.resetPaginatorData();     

                    this.isLimitPrevious = true;
                    this.isLimitNext = false;    
                }
                
                if (filter.directionPaginate == "next" ) {
                    this.isLimitPrevious = false;
                    this.isLimitNext = (isSSDocs == false || SSD_length < filter.limit);  
                }            

                this.bufferSSDocsGetted = this.bufferSSDocsGetted.concat(snapShotDocsGetted);
                this.bufferSSDocsGetted = this.util_ctrl.deleteDuplicateForObjArray(this.bufferSSDocsGetted, "ïd"); //IMPORTANTE: se usa "id" y no "_id"
                docRes = this.bufferSSDocsGetted.map((SSDoc) => SSDoc.data() as TModel);            

                break;     

            /**AcumulativeStrong llama todos los documentos en cada 
             * consulta y su acumulacion se hace desde firestore, 
             * es la que mas consumo de lecturas produce (y la que 
             * mas costos genera) */                   
            case "AccumulativeStrong":

                if (filter.directionPaginate == "initial" ) {
                    this.resetPaginatorData();                                 
                }

                if (filter.directionPaginate == "previous") {
                    this.resetPaginatorData();   
                    this.isLimitPrevious = true;
                    this.isLimitNext = false;                                
                }

                if (filter.directionPaginate == "next" ) {
                    this.isLimitPrevious = false;
                    this.isLimitNext = (isSSDocs == false || SSD_length < filter.limit); 
                }                    

                this.bufferSSDocsGetted = this.bufferSSDocsGetted.concat(snapShotDocsGetted);
                break;

            case "none":
            default:
                this.resetPaginatorData();
                break;
        }  

        /**extrae los Docs sin metadata de los 
         * snapShotDocs ya organizados y paginados 
         * y los retorna*/
        docRes = this.bufferSSDocsGetted.map((SSDoc) => SSDoc.data() as TModel); 
        return docRes;
    }

    /** 
     * *public*  
     * selecciona los *_pathDocs* o *_ids* a paginar 
     * en modo poblar
     * 
     * *Param:*  
     * `_pathDocsOr_ids` : rutas de acceso o los _ids 
     * a de los documentos a paginar.  
     * `populatorFilter` : filtro exclusivo para el 
     * modo poblar del modelo utilizado
     * ____
     */
    public configParamsPopulateForPaginate(
        _pathDocsOr_ids:string[], 
        populatorFilter:IPopulationFilter<unknown>,
    ):string[]{  

        const populate_length = populatorFilter.populateSize; 
        const bufferDocsSize = this.bufferPopulateDocGetted.length;

        /**indices de extraccion de _pathDocs */
        let idx_start = 0;
        let idx_end = 0;    

        //seleccionados
        let extract_result:string[] = [];      

        switch (this.typePagination) {
            
            case "classic":
                
                if (populatorFilter.directionPaginate == "initial") {
                    idx_end = (populate_length > populatorFilter.limit) ? 
                                 populatorFilter.limit : 
                                 populate_length; 
                }
        
                if (populatorFilter.directionPaginate == "previous") {
                    if (this.currentPopulatePage > 1) {
                        idx_start = (this.currentPopulatePage - 2) * populatorFilter.limit;
                        idx_end = (this.currentPopulatePage - 1) * populatorFilter.limit;                
                    }else{
                        if (this.isLimitPrevious == false) {
                            idx_end = (populate_length > (this.currentPopulatePage * populatorFilter.limit)) ? 
                            this.currentPopulatePage * populatorFilter.limit : populate_length;                            
                        }
                    }                       
                }
        
                if (populatorFilter.directionPaginate == "next") {
                    if (this.isLimitNext == false) {
                        idx_start = populatorFilter.limit * this.currentPopulatePage;
                        idx_end = (populate_length > ((this.currentPopulatePage + 1) * populatorFilter.limit)) ? 
                                  (this.currentPopulatePage + 1) * populatorFilter.limit : populate_length;                             
                    }
                } 

                break;

            case "classic-Acumulative":  
                if (populatorFilter.directionPaginate == "initial") {
                    idx_end = (populate_length > populatorFilter.limit) ? 
                                populatorFilter.limit : 
                                populate_length; 
                }
        
                if (populatorFilter.directionPaginate == "previous") {
                    if (this.currentPopulatePage > 1) {
                        idx_start = (this.currentPopulatePage - 2) * populatorFilter.limit;
                        idx_end = (this.currentPopulatePage - 1) * populatorFilter.limit;                
                    }else{
                        idx_end = (populate_length > (this.currentPopulatePage * populatorFilter.limit)) ? 
                        this.currentPopulatePage * populatorFilter.limit : populate_length;      
                    }                       
                }
        
                if (populatorFilter.directionPaginate == "next") {
                    if (bufferDocsSize >= (populatorFilter.limit * this.currentPopulatePage)) {
                        idx_start = populatorFilter.limit * this.currentPopulatePage;
                        idx_end = (populate_length > ((this.currentPopulatePage + 1) * populatorFilter.limit)) ? 
                                (this.currentPopulatePage + 1) * populatorFilter.limit : populate_length;                         
                    }else{
                        idx_start = populatorFilter.limit * (this.currentPopulatePage-1);
                        idx_end = populatorFilter.limit * this.currentPopulatePage;   
                    }
                } 
                break

            case "AccumulativeSimple":            

                if (populatorFilter.directionPaginate == "initial") {
                    idx_end = (populate_length > populatorFilter.limit) ? 
                                populatorFilter.limit : 
                                populate_length;     
                }
        
                if (populatorFilter.directionPaginate == "previous") {                    
                    idx_end = (populate_length >= populatorFilter.limit) ? 
                                populatorFilter.limit : 
                                populate_length;                     
                }
        
                if (populatorFilter.directionPaginate == "next") {
                    idx_start = populatorFilter.limit * this.currentPopulatePage;
                    idx_end = (populate_length > ((this.currentPopulatePage + 1) * populatorFilter.limit)) ? 
                              (this.currentPopulatePage + 1) * populatorFilter.limit : populate_length; 
                } 

                break;                
        
            case "AccumulativeStrong": 

                if (populatorFilter.directionPaginate == "initial") {
                    idx_end = (populate_length > populatorFilter.limit) ? 
                                populatorFilter.limit : 
                                populate_length;     
                }
        
                if (populatorFilter.directionPaginate == "previous") {                    
                    idx_end = (populate_length >= populatorFilter.limit) ? 
                                populatorFilter.limit : 
                                populate_length;                     
                }
        
                if (populatorFilter.directionPaginate == "next") {      
                    idx_end = (populate_length > ((this.currentPopulatePage + 1) * populatorFilter.limit)) ? 
                              (this.currentPopulatePage + 1) * populatorFilter.limit : populate_length; 
                } 

                break;
                
            case "none":
            default:
                return _pathDocsOr_ids;
                break;
        }
        extract_result = _pathDocsOr_ids.slice(idx_start, idx_end);    
        return extract_result;
    }

    /** 
     * *public*  
     * administra las propiedades del paginator en modo 
     * poblar, una vez se hallan obtenido los documentos 
     * (o array vacio) que estan siendo objetos del poblar
     * 
     * *Param:*  
     * `pDocsGetted` : los documentos que resultaron de la 
     * consulta individual para la pobalcion.  
     * `populatorFilter` : filtro exclusivo para el 
     * modo poblar del modelo utilizado.  
     * ____
     */
    public postPopulationPaginate<TModel>(
        pDocsGetted:TModel[],
        populatorFilter:IPopulationFilter<unknown>, 
    ){

        const populate_length = populatorFilter.populateSize; 
        const bufferDocsSize = this.bufferPopulateDocGetted.length;
        const modulusBuff = this.bufferPopulateDocGetted.length % populatorFilter.limit;
        const popuDocGetted_Length = pDocsGetted.length;
        const isPopuDocs = popuDocGetted_Length > 0;

        switch (this.typePagination) {
            
            /**Permite paginacion entre lotes next y previous, 
             * NO actualiza el lote limite  */
            case "classic":
                
                if (populatorFilter.directionPaginate == "initial") {
                    this.resetPaginatorData();
                }
        
                if (populatorFilter.directionPaginate == "previous") {
                    if (this.currentPopulatePage > 1) {
                        this.currentPopulatePage--;
                        this.isLimitPrevious = false;
                    }else{
                        this.isLimitPrevious = true;
                    }
                    this.isLimitNext = false;                      
                }
        
                if (populatorFilter.directionPaginate == "next") {
                    if (populate_length > (this.currentPopulatePage * populatorFilter.limit)) {
                        this.currentPopulatePage++;
                        this.isLimitNext = false;
                    }else{
                        this.isLimitNext = true;
                    }   

                    this.isLimitPrevious = false;
                }   

                if (pDocsGetted.length > 0) {
                    this.bufferPopulateDocGetted  = pDocsGetted                      
                }
                break;

            /**Permite paginacion acumulativa y con direccion 
             * next y previous y si actualiza el ultimo lote*/
            case "classic-Acumulative":
                if (populatorFilter.directionPaginate == "initial") {
                    this.resetPaginatorData();
                }
        
                if (populatorFilter.directionPaginate == "previous") {
                    if (this.currentPopulatePage > 1) {
                        this.currentPopulatePage--;
                        this.isLimitPrevious = false;
                    }else{
                        this.isLimitPrevious = true;
                    }
                    this.isLimitNext = false;    
                    
                    if (isPopuDocs) {
                        const _id_pDoc = pDocsGetted[0]["_id"];
                        let initialCutB = (this.bufferPopulateDocGetted.findIndex((B_pDoc) => B_pDoc["_id"] == _id_pDoc))    
                        if(initialCutB >= 0 ){
                            this.bufferPopulateDocGetted.splice(initialCutB); 
                        }                        
                    }
                    
                }
        
                if (populatorFilter.directionPaginate == "next") {
                    if (populate_length >= (this.currentPopulatePage * populatorFilter.limit)) {
                        this.currentPopulatePage++;
                        this.isLimitNext = false;
                    }else{
                        this.isLimitNext = true;
                    }   

                    this.isLimitPrevious = false;
                }   

                this.bufferPopulateDocGetted  = this.bufferPopulateDocGetted.concat(pDocsGetted);
                this.bufferPopulateDocGetted = this.util_ctrl.deleteDuplicateForObjArray(this.bufferPopulateDocGetted, "_id")
                break;

            case "AccumulativeSimple":
                if (populatorFilter.directionPaginate == "initial") {
                    this.resetPaginatorData();
                }
        
                if (populatorFilter.directionPaginate == "previous") {
                    this.resetPaginatorData();
                    
                    this.isLimitPrevious = true;
                    this.isLimitNext = false;
                }
        
                if (populatorFilter.directionPaginate == "next") {                 
                    if (populate_length > (this.currentPopulatePage * populatorFilter.limit)) {
                        this.currentPopulatePage++;
                        this.isLimitNext = false;   
                    }else{
                        this.isLimitNext = true;   
                    }
                    this.isLimitPrevious = false;                                   
                }
                
                this.bufferPopulateDocGetted  = this.bufferPopulateDocGetted.concat(pDocsGetted);
                break;                 

            case "AccumulativeStrong":                
                
                if (populatorFilter.directionPaginate == "initial") {
                    this.resetPaginatorData();
                }
        
                if (populatorFilter.directionPaginate == "previous") {
                    this.resetPaginatorData();
                    
                    this.isLimitPrevious = true;
                    this.isLimitNext = false;                   
                }
        
                if (populatorFilter.directionPaginate == "next") {
                    if (populate_length > (this.currentPopulatePage * populatorFilter.limit)) {
                        this.currentPopulatePage++;
                        this.isLimitNext = false;   
                    }else{
                        this.isLimitNext = true;   
                    }
                    this.isLimitPrevious = false;     
                }   
                this.bufferPopulateDocGetted  = pDocsGetted;           
                break;                

            case "none":         
            default:
                this.bufferPopulateDocGetted  = pDocsGetted  
                break;
        }

        pDocsGetted = <TModel[]>this.bufferPopulateDocGetted.filter((doc)=>(doc && doc != null));

        return pDocsGetted;
    }

    /** 
     * *public*  
     * devuelve el estado del limite
     *  de paginacion en direccion "next"
     * ____
     */
    public getLimitNext(){
        return this.isLimitNext;
    }

        /** 
     * *public*  
     * devuelve el estado del limite
     *  de paginacion en direccion "previous"
     * ____
     */
    public getLimitPrevious(){
        return this.isLimitPrevious;
    }


}