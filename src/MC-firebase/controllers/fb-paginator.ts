import { IFilter, IPopulationFilter } from "./filter-handler";

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

    /**
     * contenedor de snapShotsDoc 
     * que se usarana para paginar 
     * con metodo startAfter(); 
     * el primer elemento siempre es 
     * `null`
     */
    private listSnapDocsStart: any[];

    /**util solo para mostras los ids 
     * almacenados como snapDocsStart*/
    private idsSSDocs:string[];

    /**
     * al realizar una consulta esta puede devolver 
     * menos del limite de documentos que se tiene 
     * asignado, esta propiedad almacena la cantidad 
     * de faltantes de documentos que hubo despues de
     * una consulta (si n hubo se asigna 0)
     */
    private numDocsMissing:number;

    /**
     * la cantidad de documentos leidos y paginados 
     * hasta el momento, es ideal para los tipos 
     * de paginacion (*AccumulativeSimple* 
     * *AccumulativeStrong*) tambien usada en poblar 
     */
    private currentNumDocsGetted:number;

    /**
     * la pagina actual en logica 1
     */    
    private currentPage:number;

    /**
     * el limite actual configurado por la 
     * instancia de filtro
     */    
    private currentLimit:number;

    /**
     * las opciones de paginacion actuales 
     * recibidas en el objeto de filtrado, 
     * las opciones son: *none*, *start*, 
     * *previous*, *next*
     */    
    private currentDirectionPaginate:"initial" |"previous" |"next"; 

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
         * *previous* y *next* .  
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
         * el lote
         */
        private _typePagination: "none" | "classic" | "AccumulativeSimple" | "AccumulativeStrong" = "classic",       
    ) {        
        this.resetPaginatorData();
        this.currentNumDocsGetted = 0;
        this.currentLimit = 0;
    }

    /** 
     * getter de tipo de paginacion
     * ____
     */
    public get typePagination(): "none" | "classic" | "AccumulativeSimple" | "AccumulativeStrong" {
        return this._typePagination;
    }
    /** 
     * setter de tipo de paginacion para actualizar en tiempo de ejecucion.
     * la actualizacion de esta propiedad conlleva a borrar los datos de 
     * antiguo tipo de paginacion como (snapshotsDocs, currentLimits, 
     * currenDirectionPaginatio y currentPage)
     * ____
     */    
    public set typePagination(type: "none" | "classic" | "AccumulativeSimple" | "AccumulativeStrong") {
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
        this.listSnapDocsStart = [null];
        this.idsSSDocs = [""];
        this.currentPage = 1;
        this.currentDirectionPaginate = "initial";
        this.numDocsMissing = 0;
        return;
    }

    /** 
     * *public*  
     * selecciona y devuelve el *SnapShotDocument* a 
     * usarlo como start para la paginacion del 
     * *cursorQuery*
     * 
     * *Param:*  
     * `filter` : objeto con la configuracion del filtro 
     * a usar en la consulta.  
     * ____
     */
    public prePaginateForQuery(        
        filter:IFilter<unknown>        
    ):any{

        this.currentDirectionPaginate = filter.directionPaginate; 

        /** indice del SnapShotdocument a configurar en el cursor*/
        let idxSSDoc = 0;

        switch (this.typePagination) {
                  
            case "classic":

                /**la opcion `"start"` siempre se pagina desde 
                 * el inicial representado como `null`*/
                if (this.currentDirectionPaginate == "initial") {
                    idxSSDoc = 0; //seleccionará el null
                }
                /**la opcion `"previous"` asigna el indice del 
                 * contenedor, recordar que lo minimo del 
                 * contenedor deben tener 2 elementos*/                            
                if (this.currentDirectionPaginate == "previous") {
                    idxSSDoc = (this.listSnapDocsStart.length > 2) ? 
                                this.listSnapDocsStart.length -3 : 0;
                }
                /**la opcion `"next"` asigna el ultimo indice*/ 
                if (this.currentDirectionPaginate == "next") {
                   idxSSDoc = this.listSnapDocsStart.length -1;
                }  
                break;

            /** en las opciones acumulativas, los indices se 
             * comportan igual y el contenedor de listSnapDocsStart
             * solo almacenará 1 elemento */  
            case "AccumulativeSimple": 
            case "AccumulativeStrong":  
                
                if (this.currentDirectionPaginate == "initial" ||
                     this.currentDirectionPaginate == "next" 
                ) {
                    /**se escoge el index del UNICO elemento 
                     * que debe tener el contenedor*/
                    idxSSDoc = 0;
                }                 
                if (this.currentDirectionPaginate == "previous") {
                    /**el metodo se devuelve aqui ya que el null 
                     * retornado puede NO estar asignado a 
                     * listSnapDocsStart y mientras no se halla 
                     * concretado la consulta las propiedades como
                     *  listSnapDocsStart no deben ser modificadas
                     * */
                    return null
                }  
                break;
            
            case "none":                
            default:
                /**se asigna a su estado inicial */
                idxSSDoc = 0;
                break;
  
        }
        const SSDoc = this.listSnapDocsStart[idxSSDoc];
        return SSDoc;
    }

    /** 
     * *public*  
     * gestiona el contenedor de *listSnapDocsStart* del 
     * manejador de paginacion y actualiza el index, una 
     * vez ya realizada la lectura de documentos
     * 
     * *Param:*  
     * `snapShotDocsGetted` : los ultimos Documentos 
     * obtenidos de la ultima Consulta realizada.  
     * `filter` : el filtro usado en la ultima consulta
     * ____
     */
    public postPaginatePostQuery(
        snapShotDocsGetted: any[], 
        filter: IFilter<unknown>
    ) {

        this.currentDirectionPaginate = filter.directionPaginate;
        this.currentLimit = filter.limit;

        let SSD_length = snapShotDocsGetted.length;
        const lastSSDoc = (SSD_length > 0) ?
            snapShotDocsGetted[SSD_length - 1] :
            null;


        switch (this.typePagination) {

            case "classic":
                /**la opcion `"start"` resetea las propiedades 
                 * del paginador y determina (si se leyeron 
                 * documentos) agregar el ultimo *snapShotDoc* 
                 * al contenedor, actualiza la propiedad de
                 *  *numDocsMissing*
                 */
                if (this.currentDirectionPaginate == "initial") {
                    this.resetPaginatorData();
                    if (SSD_length > 0) {
                        this.listSnapDocsStart.push(lastSSDoc);
                        this.idsSSDocs.push(lastSSDoc["id"]);
                    }
                    this.numDocsMissing = this.currentLimit - SSD_length;
                    return;
                }

                /**la opcion `"previous"` elimina el ultimo 
                 * *snapShotDocument* siempre y cuando la lista
                 * *listSnapDocsStart* contenga al menos 2 elementos
                 * `[null, {SSDoc}]` y acutualiza los faltantes
                 */
                if (this.currentDirectionPaginate == "previous") {

                    if (this.listSnapDocsStart.length > 2) {
                        this.listSnapDocsStart.pop();
                        this.idsSSDocs.pop();
                        
                        this.currentPage--;

                    }
                    /*se actualiza el ultimo elemento del contenedor siempre 
                    y cuando este no sea el elemento de index 0 */
                    if (SSD_length > 0 ) {
                        this.listSnapDocsStart[this.listSnapDocsStart.length - 1] = lastSSDoc;   
                        this.idsSSDocs[this.idsSSDocs.length - 1] = lastSSDoc["id"];
                    }

                    this.numDocsMissing = this.currentLimit - SSD_length;
                    return;
                }
                /**la opcion `"next"` puede tener diferentes 
                 * estados dependiendo de si se obtubieron 
                 * docs en la consulta, si la consulta 
                 * anterior a esta estaban sin faltantes, 
                 * si los Doc leidos son menos qu los faltantes 
                 * y viceversa
                 */
                if (this.currentDirectionPaginate == "next") {

                    if (SSD_length > 0) {

                        if (this.numDocsMissing == 0 ) {          

                             /**Agrega nuevo SSDoc referencial a la lista*/
                             this.listSnapDocsStart.push(lastSSDoc);
                             this.idsSSDocs.push(lastSSDoc["id"]);
                             
                             this.numDocsMissing = this.currentLimit - SSD_length;
                             this.currentPage++;
                             return
                     
                        }

                        if (SSD_length <= this.numDocsMissing) {
                            /**Actualiza el ultimo SSDoc referencial 
                             * de la lista, pero no lo agrega como nuevo*/
                            this.listSnapDocsStart[this.listSnapDocsStart.length - 1] = lastSSDoc;
                            this.idsSSDocs[this.idsSSDocs.length - 1] = lastSSDoc["id"];

                            this.numDocsMissing = this.numDocsMissing - SSD_length;
                            return;
                        }                        

                        if (SSD_length > this.numDocsMissing) {
                            /**Actualiza el ultimo SSDoc referencial a la  
                             * lista en el punto exacto (idxF) donde se  
                             * completan los faltantes y se agrega el 
                             * ultimo SSDoc del exceso*/
                            const idxF = this.numDocsMissing - 1;
                            this.listSnapDocsStart[this.listSnapDocsStart.length - 1] = snapShotDocsGetted[idxF];
                            this.idsSSDocs[this.idsSSDocs.length - 1] = snapShotDocsGetted[idxF]["id"];
                            this.listSnapDocsStart.push(lastSSDoc);
                            this.idsSSDocs.push(lastSSDoc["id"]);
                            
                            this.currentPage++;
                            this.numDocsMissing = this.currentLimit - (SSD_length - this.numDocsMissing);
                            return;
                        }                      

                    }
                    return;
                }    
                return;              
                break;
                
            case "AccumulativeSimple":
                /**la opcion `"start"` reinician las propiedades
                 *  del paginator y asignan el ultimo SSDoc
                 *  al contenedor (si la consulta 
                 * devolvió resultados)
                 */               
                if (this.currentDirectionPaginate == "initial" ) {
                    this.resetPaginatorData();
                    if (SSD_length > 0) {
                        this.listSnapDocsStart[0] = lastSSDoc;
                        this.idsSSDocs[0] = lastSSDoc["id"];                        
                    }
                    this.currentNumDocsGetted = SSD_length;
                    return;                    
                }
                /**la opcion `"previous"` reinician las 
                 * propiedades del paginator y asignan el 
                 * ultimo SSDoc al contenedor (si la consulta 
                 * devolvió resultados)
                 */                 
                if (this.currentDirectionPaginate == "previous") {
                    this.resetPaginatorData();
                    if (SSD_length > 0) {
                        this.listSnapDocsStart[0] = lastSSDoc;
                        this.idsSSDocs[0] = lastSSDoc["id"];
                    }
                    this.currentNumDocsGetted = SSD_length;                   
                    return;
                }
                /**la opcion `"next"` si se recibieron resultados 
                 * actualiza las propiedades del paginator 
                 * (incluyendo la pagina actual)
                 */                 
                if ( this.currentDirectionPaginate == "next" ) {

                    if (SSD_length > 0) {                        
                        this.listSnapDocsStart[0] = lastSSDoc;
                        this.idsSSDocs[0] = lastSSDoc["id"];
                    }
                    
                    this.currentNumDocsGetted += SSD_length;                        
                    this.currentPage = Math.ceil(this.currentNumDocsGetted / this.currentLimit);                                            
                                        
                    return;                    
                }                
                return;
                break;     

            case "AccumulativeStrong":

                if (this.currentDirectionPaginate == "initial" ) {
                    this.resetPaginatorData();
                    this.currentNumDocsGetted = SSD_length;                    
                    return;                    
                }

                if (this.currentDirectionPaginate == "previous") {
                    this.resetPaginatorData();
                    this.currentNumDocsGetted = SSD_length;                    
                    return;
                }

                if (this.currentDirectionPaginate == "next" ) {

                    this.currentNumDocsGetted = SSD_length;
                    this.currentPage = Math.ceil(this.currentNumDocsGetted / this.currentLimit);       

                    return;                    
                }            

                return;
                break;

            case "none":
            default:
                this.resetPaginatorData();
                break;
        }      
        return;
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
    public prePopulationPaginate(
        _pathDocsOr_ids:string[], 
        populatorFilter:IPopulationFilter<unknown>,
    ):string[]{
        
        //seleccionados
        let extract_result:string[] = [];        

        this.currentDirectionPaginate = populatorFilter.directionPaginate;  
        this.currentLimit = populatorFilter.limit;


        /**indices de extraccion de _pathDocs */
        let idx_start = 0;
        let idx_end = 0;    

        switch (this.typePagination) {
            
            case "classic":
                
                if (this.currentDirectionPaginate == "initial") {
                    idx_end = (_pathDocsOr_ids.length > (this.currentPage * this.currentLimit)) ? 
                                this.currentPage * this.currentLimit : _pathDocsOr_ids.length; 
                }
        
                if (this.currentDirectionPaginate == "previous") {
                    if (this.currentPage > 1) {
                        idx_start = (this.currentPage - 2) * this.currentLimit;
                        idx_end = (this.currentPage - 1) * this.currentLimit;                
                    }else{
                        idx_end = (_pathDocsOr_ids.length > (this.currentPage * this.currentLimit)) ? 
                        this.currentPage * this.currentLimit : _pathDocsOr_ids.length;
                    }                       
                }
        
                if (this.currentDirectionPaginate == "next") {
                    idx_start = this.currentLimit * this.currentPage;
                    idx_end = (_pathDocsOr_ids.length > ((this.currentPage + 1) * this.currentLimit)) ? 
                              (this.currentPage + 1) * this.currentLimit : _pathDocsOr_ids.length; 
                } 

                extract_result = _pathDocsOr_ids.slice(idx_start, idx_end);                 
                break;

            case "AccumulativeSimple":            

                if (this.currentDirectionPaginate == "initial") {
                    idx_end = (_pathDocsOr_ids.length > this.currentLimit) ? 
                                this.currentNumDocsGetted + this.currentLimit : 
                                _pathDocsOr_ids.length;     
                }
        
                if (this.currentDirectionPaginate == "previous") {                    
                    idx_end = (_pathDocsOr_ids.length >= this.currentLimit) ? 
                                this.currentLimit : 
                                _pathDocsOr_ids.length;                     
                }
        
                if (this.currentDirectionPaginate == "next") {
                    idx_start = (_pathDocsOr_ids.length > this.currentNumDocsGetted) ? 
                                this.currentNumDocsGetted : this.currentNumDocsGetted - this.currentLimit;
                                
                    idx_end = (_pathDocsOr_ids.length > (this.currentNumDocsGetted + this.currentLimit)) ? 
                                this.currentNumDocsGetted + this.currentLimit : _pathDocsOr_ids.length;
                } 

                extract_result = _pathDocsOr_ids.slice(idx_start, idx_end);
                break;                
        
            case "AccumulativeStrong": 

                if (this.currentDirectionPaginate == "initial") {
                    idx_end = (_pathDocsOr_ids.length > this.currentLimit) ? 
                                this.currentNumDocsGetted + this.currentLimit : 
                                _pathDocsOr_ids.length;     
                }
        
                if (this.currentDirectionPaginate == "previous") {                    
                    idx_end = (_pathDocsOr_ids.length >= this.currentLimit) ? 
                                this.currentLimit : 
                                _pathDocsOr_ids.length;                     
                }
        
                if (this.currentDirectionPaginate == "next") {      
                    idx_end = (_pathDocsOr_ids.length > (this.currentNumDocsGetted + this.currentLimit)) ? 
                                this.currentNumDocsGetted + this.currentLimit : _pathDocsOr_ids.length;
                } 

                extract_result = _pathDocsOr_ids.slice(idx_start, idx_end);
                break;
                
            case "none":
            default:
                return _pathDocsOr_ids;
                break;
        }

        return extract_result;
    }

    /** 
     * *public*  
     * administra las propiedades del paginator en modo 
     * poblar, una vez se hallan obtenido los documentos 
     * (o array vacio) que estan siendo objetos del poblar
     * 
     * *Param:*  
     * `docs` : los documentos que resultaron de la 
     * consulta individual para la pobalcion.  
     * `populatorFilter` : filtro exclusivo para el 
     * modo poblar del modelo utilizado.  
     * ____
     */
    public postPopulationPaginate<TModel>(
        docs:TModel[],
        populatorFilter:IPopulationFilter<unknown>, 
    ){

        this.currentDirectionPaginate = populatorFilter.directionPaginate; 
        this.currentLimit = populatorFilter.limit;

        switch (this.typePagination) {
            
            case "classic":
                
                if (this.currentDirectionPaginate == "initial") {
                    this.currentPage = 1;
                }
        
                if (this.currentDirectionPaginate == "previous") {
                    if (this.currentPage > 1) {
                        this.currentPage--;
                    }                      
                }
        
                if (this.currentDirectionPaginate == "next") {
                    if (docs.length > (this.currentPage * this.currentLimit)) {
                        this.currentPage++;
                    }   
                }     
                break;

            case "AccumulativeSimple":
                if (this.currentDirectionPaginate == "initial") {
                    this.currentNumDocsGetted = docs.length;
                    this.currentPage = 1;
                }
        
                if (this.currentDirectionPaginate == "previous") {
                    this.currentNumDocsGetted = docs.length;
                    this.currentPage = 1;                   
                }
        
                if (this.currentDirectionPaginate == "next") {
                    this.currentNumDocsGetted += docs.length;                   
                    this.currentPage = Math.ceil(this.currentNumDocsGetted / this.currentLimit);
                }   
                break;                 

            case "AccumulativeStrong":                
                
                if (this.currentDirectionPaginate == "initial") {
                    this.currentNumDocsGetted = docs.length;
                    this.currentPage = 1;
                }
        
                if (this.currentDirectionPaginate == "previous") {
                    this.currentNumDocsGetted = docs.length;
                    this.currentPage = 1;                   
                }
        
                if (this.currentDirectionPaginate == "next") {
                    this.currentNumDocsGetted += docs.length;                   
                    this.currentPage = Math.ceil(this.currentNumDocsGetted / this.currentLimit);
                }   
                break;                

            case "none":         
            default:
                break;
        }

        return;
    }

    /** 
     * *public*  
     * determina que concatenacion realizar de 
     * acuerdo a de los nuevos documentos leidos 
     * en comparacion con los documentos anteriores
     * y al tipo de paginacion que se este usando  
     * 
     * *Param:*  
     * `accumulatedDocs` : los documentos anteriormente leidos
     * y actualmente mostrados.  
     * `gettedDocs` : los nuevos documentos leidos
     * ____
     */
    public concatDocsBeforeGetted<TModel>(
        accumulatedDocs:TModel[], 
        gettedDocs:TModel[]
    ):TModel[]{
        //convertirlos a arrays
        accumulatedDocs = (Array.isArray(accumulatedDocs)) ? accumulatedDocs : [accumulatedDocs];
        gettedDocs = (Array.isArray(gettedDocs)) ? gettedDocs : [gettedDocs];

        const accumDocsSize = accumulatedDocs.length;
        const gettedDocSize = gettedDocs.length;

        switch (this.typePagination) {
            
            case "classic":

            //­­­___ <TEST> _____________________________________
            //New:
            // if (gettedDocSize <= 0) {
            //     return accumulatedDocs;
            // }else{
            //     if ((gettedDocSize + accumDocsSize) > this.currentLimit) {
                    
            //     }
            // }
            
            //________________________________________________
            //Old:
            if ((gettedDocs.length + accumulatedDocs.length) <= this.currentLimit ) {
                return accumulatedDocs.concat(gettedDocs);
            }
            return gettedDocs;            
            
            //________________________________________________                

                break;
        
            case "AccumulativeSimple":
                if (this.currentPage == 1) {
                    return gettedDocs;
                }
                if (gettedDocs.length > 0) {
                    return accumulatedDocs.concat(gettedDocs);
                }
                return accumulatedDocs;
                break;

            case "AccumulativeStrong":
                return gettedDocs;
                break;   
                
            default: 
                return gettedDocs;
                break;
        }
    }

    /** 
     * *public*  
     * el tipo de paginacion que tiene configurado 
     * este *paginator*
     * ____
     */
    // public getTypePagination(){
    //     return this.typePagination;
    // }

    /** 
     * *public*  
     * retorna el numero de la pagina actual que  
     * contienelos documentos mas recientemente 
     * leidos.  
     * **Importante**
     * Siempre se maneja con logica 1
     * ____
     */
    public getCurrentPage():number{
        return this.currentPage;
    }

    /** 
     * *public*  
     * formatea el limite de acuerdo al *typePagination* 
     * (caso especial para *AccumulativeStrong*) y al 
     * *optionPaginate* usado antes de la configuracion 
     * de la query.  
     * **Recordar** solo usado para la preQuery de 
     * paginar (NO usar para poblar)
     * ____
     */
    public formatLimitPreQuery(
        limit:number, 
        directionPaginate:"initial" |"previous" |"next"
    ):number{

        if (this.typePagination != "AccumulativeStrong") {
            /*cualquier otro tipo de paginacion se usa 
            el limite del filtro */
            return limit;
        }
        /*se determina como manejar un limite acumulativo 
        fuerte de acuerdo a la pagina actual y si no es
         *previous* */
        limit = (this.currentNumDocsGetted > 0 && 
                directionPaginate != "previous") ? 
                (this.currentPage + 1) * limit :
                limit;   

        return limit;
    }

    /** 
     * *public*  
     * determina si al llegar al limite de la paginacion 
     * (para este caso el limite inicial *previous*) si 
     * se permite o no releer los documentos de esta pagina 
     * limite.  
     * **usar con precaucion**  
     * el permitir releer (ya sea en una o ambas 
     * direcciones) permitirá actualizar cambios que se 
     * hallan producido en el documento pero generando 
     * asi un sobredemanda de lecturas de documentos. 
     * 
     * **NO OPERATIVA**
     * ____
     */
    public isPreviousLimited(isReread=false):boolean{
        /*determinar si es la primera pagina */
        if (this.currentPage > 1) {
            return false;
        }

        /*se deduce que si es releido se hace un toogle de la flag */
        return !(isReread);

    }

    /** 
     * *public*  
     * determina si al llegar al limite de la paginacion 
     * (para este caso el limite inicial *previous*) si 
     * se permite o no releer los documentos de esta pagina 
     * limite.  
     * **usar con precaucion**  
     * el permitir releer (ya sea en una o ambas 
     * direcciones) permitirá actualizar cambios que se 
     * hallan producido en el documento pero generando 
     * asi un sobredemanda de lecturas de documentos. 
     * 
     * **NO OPERATIVA**
     * ____
     */
    public isNextLimited(isReread=false):boolean{
        /*determinar si es la ultima pagina */
        //---como lo hago?

        /*se deduce que si es releido se hace un toogle de la flag */
        return !(isReread);

    }    
}