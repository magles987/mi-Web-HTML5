import { v4 } from "uuid";
import { ModelMetadata, IFieldMeta, EFieldType, ETypeCollection } from "./meta";
//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *class* 
 * Utlidades generales para usar en los *controllers* 
 * para Firestore
 * 
 * ____
 */
export class UtilControllers {

    /** *private static*  
     * Almacena la instancia única de esta clase
     * ____
     */
    private static instance:UtilControllers;

    /** 
     * `constructor()`  
     * 
     * ____
     */
    constructor() {}

    /** `getInstance()`  
     * devuelve la instancia única de esta clase  
     * ya sea que la crea o la que ya a sido creada
     * ____
     */
    public static getInstance():UtilControllers{
        UtilControllers.instance = (!UtilControllers.instance || UtilControllers.instance == null) ?
                    new UtilControllers() : UtilControllers.instance;
        return UtilControllers.instance;
    }    

    /** 
     * *public*  
     * generar _ids personalizados con base en 
     * tiempo para documentos Firestore
     * ____
     */
    public createIds(): string {

        // obtener la fecha en UTC en HEXA,:  
        //obtener la diferencia horaria del dispositivo con respecto al UTC 
        //con el fin de garantizar la misma zona horaria. 
        // getTimezoneOffset() entrega la diferencie en minutos, es necesario 
        //convertirlo a milisegundos    
        const difTime = new Date().getTimezoneOffset() * 60000;
        //se obtiene la fecha en hexa par alo cual se resta la diferencia 
        //horaria y se convierte a string con base 16
        const keyDate = (Date.now() - difTime).toString(16);

        // el formtato al final que obtengo es:
        //  n-xxxxxxxxxxxxxxxx
        //donde  n   es el numero   _orderkey  y las  x   son el hexa  generado por el uuid
        let key = v4();
        key = key.replace(/-/g, ""); //quitar guiones
        key = key.slice(16); //quitar los 16 primeros bytes para que no sea tan largo el path de busqueda
        key = `${keyDate}-${key}`;
        return key;

    }

    /** 
     * *public*  
     * obtener el path de la coleccion o subcoleccion, en las 
     * colecciones devuelve el mismo nom ya que son Raiz
     * 
     * *Param:*  
     * `modelMeta` : la metadata del modelo para 
     * usar como referencia.  
     * `pathBase` : path complemento para construir 
     * el el path completoutil para las subcolecciones
     * ____
     */
    public getPathCollection(modelMeta:unknown, pathBase=""):string{

        //en caso de recibir null
        if (pathBase == null) {
            pathBase = "";
        }

        //cast obligado:
        const col_Meta = <ModelMetadata>modelMeta;

        const r = (col_Meta.__typeCollection == ETypeCollection.subCollection && pathBase != "") ?
            `${pathBase}/${col_Meta.__nomColeccion}` :
            `${col_Meta.__nomColeccion}`;

        return r;

    }   

    /** 
     * *public*  
     * retorna la ruta _pathDoc sin el _id
     * usado para construir consulta de un 
     * solo documento o subcolecciones
     * 
     * *Param:*  
     * `_pathDoc`  : completo
     * ____
     */
    public get_pathDocWithout_id(_pathDoc:string):string{
        //determinar si es un _pathDoc valido por medio de
        //secciones de tipo  ruta/  id/ ....
        const re_sectionPath = /[a-zA-Z0-9-_]+\//g;
        if(re_sectionPath.test(_pathDoc) === false){
          throw new Error(`${_pathDoc} no es un _pathDoc valido`);          
        }
        
        //eliminar el ultimo "/" si existe
        let idxLast = _pathDoc.length -1;
        if(_pathDoc.substring(idxLast) === "/"){
          _pathDoc = _pathDoc.substring(0, idxLast);
        }

        //reordena el ultimo index de acuerdo al ultimo separador "/" 
        idxLast = _pathDoc.lastIndexOf("/");
        //retorna solo _pathDoc sin el ultimo _id
        const r = _pathDoc.substring(0, idxLast);
        return r;

    }

    /** 
     * *public*  
     * retorna el _id sin la ruta _pathDoc 
     * usado para construir consultas de un 
     * solo documento o subcolecciones
     * 
     * *Param:*  
     * `_pathDoc` : completo 
     * ____
     */
    public get_idWithout_pathDoc(_pathDoc:string):string{
        //determinar si es un _pathDoc valido por medio de
        //secciones de tipo  ruta/  id/ ....
        const re_sectionPath = /[a-zA-Z0-9-_]+\//g;
        if(re_sectionPath.test(_pathDoc) === false){
          throw new Error(`${_pathDoc} no es un _pathDoc valido`);          
        }
        
        //eliminar el ultimo "/" si existe
        const idxLast = _pathDoc.length -1;
        if(_pathDoc.substring(idxLast) === "/"){
          _pathDoc = _pathDoc.substring(0, idxLast);
          
        }

        //retorna solo el ultimo _id de la ruta
        const r = _pathDoc.replace(re_sectionPath, "");
        return r;
    }    

    /** 
     * *public*  
     * crea una instancia del modelo (tipo *class*) con 
     * los campos ya inicializados segun la metadata 
     * del modelo
     * 
     * *Param:*  
     * `modelMeta` : instancia de los metadatos del 
     * modelo (se recibe como any ya que puede ser 
     * cualquier *modelMeta* e incluso *subMeta* de 
     * forma recursiva) 
     * ____
     */
    public createEmptyModel<TModel>(
        modelMeta:ModelMetadata
    ):TModel{
        
        let Model = <TModel>{};

        for (const key_MM in modelMeta) {
            
            const fieldMeta = <IFieldMeta<any, unknown>>modelMeta[key_MM];         

            if (fieldMeta.nom && fieldMeta.nom != null &&
                fieldMeta.fieldType && fieldMeta.fieldType != null 
            ) {

                /*Tratamiento de formateo a embebidos o subColecciones */
                if (fieldMeta.fieldType == EFieldType.embedded) {
                    //----[falta analisis]---
                    Model[<string>key_MM] = fieldMeta.default || [];
                    continue;
                }

                /*tratamiento de referencial por _id o _pathDoc */
                if (fieldMeta.fieldType == EFieldType.foreignKey) {
                    //----[falta analisis]---
                    Model[<string>key_MM] = fieldMeta.default || 
                                            //contingencia por si no existe default
                                            (fieldMeta.isArray) ? [] : null;
                    continue;        
                }              

                /*tratamiento de clon de objeto por medio de referencia */
                if (fieldMeta.fieldType == EFieldType.foreignClone) {
                    //----[falta analisis]---
                    Model[<string>key_MM] = fieldMeta.default || 
                                            //contingencia por si no existe default
                                            (fieldMeta.isArray) ? [] : {};
                    continue;        
                }                         

                /*tratamiento de estructura simple */
                if (fieldMeta.fieldType == EFieldType.objectOrMap) {

                    if (!fieldMeta.structureFConfig || 
                        fieldMeta.structureFConfig == null  
                    ) {
                        throw new Error("no tiene la estructura configurada para crear el modelo");                        
                    }

                    const ext_MMeta = fieldMeta.structureFConfig.extModelMeta;

                    //tratamiento segun array
                    if (fieldMeta.isArray) {

                        if (!ext_MMeta || ext_MMeta == null) {
                            //asignar un array por default
                            Model[<string>key_MM] = (Array.isArray(fieldMeta.default)) ? 
                                                     fieldMeta.default : [fieldMeta.default];
                            continue;     
                        }

                        /*crea el sub modelo a partir de la metada extendida */
                        const subModel = this.createEmptyModel(<ModelMetadata>ext_MMeta);

                        //crea un array de 1 solo elemento default, si 
                        //se quiseran mas se debe modificar las interfaces 
                        //de metadata para permirmitir array de defaults 
                        //en subEstructuras
                        Model[<string>key_MM] = [subModel];                    
                        
                    }else{
                        /*crea el sub modelo a partir de la metada extendida */
                        const subModel = this.createEmptyModel(<ModelMetadata>ext_MMeta);
                        Model[<string>key_MM] = subModel;
                    }
                    continue;                              
                }    

                //tratamiento de primitivos (incluye array promitivos)
                if (fieldMeta.isArray) {
                    Model[<string>key_MM] = (Array.isArray(fieldMeta.default)) ?
                                             fieldMeta.default : [fieldMeta.default];                    
                }else{
                    Model[<string>key_MM] = fieldMeta.default;
                }
            }

        }
        return Model;
    }

    /** 
     * *public*  
     * Un comportamiento extraño de Firestore hace que no se 
     * pueda ejecutar consultas de igualacion en campos 
     * numericos y al mismo tiempo paginarlos, esta utilidad 
     * permite obtener un numero (el siguiente mas cercano) 
     * al numero de igualdad que se desea consultar.  
     * este comportamiento se explica asi:  
     * **NO Funcional** @example 
     * ```typescript
     * const cant = 100;
     * cursorQuery = cursorQuery.where("campoNumerico", "==", cant)
     *              .orderBy("_id").startAt("_id inicial de pagina")
     * ```
     * las pruebas del anterior codigo mostraron que realiza la consulta 
     * pero Firestore asume que al ser Igualdad no permite la paginacion 
     * con el metodo startAt().  
     * Se plante la siguiente opcion "poco elegante":  
     * **Funcional** @example
     * ```typescript
        const cant = 100
        let ini = _Util.ajustarDecimales("round", cant, expFactorRedondeo);   
        let iniMaxFactor = _Util.maxFactorEqualQuery(ini, expFactorRedondeo);
        cursorQuery = cursorQuery.where("campoNumerico", ">=", ini)
                                 .where("campoNumerico", "<", iniMaxFactor);
     * ```
     * en este codigo se realiza un redondeo a `cant` (el numero a comparar) 
     * para garantizar que este en el formato de decimales preconfigurado y 
     * posteriormente se crea un factor de comparacion `iniMaxFactor` 
     * que se obtiene de metodo `maxFactorEqualQuery()` el cual analiza el 
     * numero a comparar con un exponente de redondeo `expFactorRedondeo` 
     * y devuelve el numero inmediatamente siguiente con el cual se debe 
     * realizar una comparacion de minimo y maximo para "simular" una 
     * igualdad.  
     * Aclaracion del ejemplo de solucion:  
     * Si `campoNumerico` contiene un entero (positivo o negativo)
     * se devolverá un `(campoNumerico + 0.1)`.  
     * Si `campoNumerico` contiene un formato decimal (con 3 decimales  
     * sin importar si es positivo o negativo)
     * se devolverá un `(campoNumerico + 0.0001)`.  
     * Si `campoNumerico` se usa como booleano numerico (otro comportamiento 
     * raro de Firestore) se devolverá un `(campoNumerico + 0.1)`.
     * 
     * *Param:*  
     * `numEqual` : valor numerico que se desea comparar en igualdad.  
     * `expFactor` : factor exponencial para decimales  
     * ____
     */
    public maxFactorEqualQuery(numEqual:number, expFactor:number):number{

        //verificar valores numericos
        if (!expFactor || 
            expFactor == null ||
            isNaN(expFactor) ||
            !numEqual || 
            isNaN(numEqual) || 
            numEqual == null
        ) {
            return numEqual;
        }

        let expF = expFactor;
        //expFactor debe ser negativo o 0 (garantiza decimales)
        if (expF > 0) {
            expF = 0;
        }
        //calcula el maximo factor para el query
        const maxFactor = numEqual + (Math.pow(10, (expF-1)));
        return maxFactor;
    }

    /**
     * permite eliminar *objetos* duplicados de un array en base 
     * a una de sus propiedades que debe ser *UNICA* y preferiblemente 
     * autoincremental (especialmente se usa algun tipo de _id)
     * 
     * *Param:*  
     * `ObjsArray` : el array de objetos a depurar duplicados 
     * `key_field` : **nombre** del campo (que cada objeto tiene) que sirve 
     * como referencia o llave para eliminar los duplicados (se 
     * usa mucho el _id)       
     */
    public deleteDuplicateForObjArray<T>(ObjsArray:T[], key_field:string):T[]{

        ObjsArray = (Array.isArray(ObjsArray)) ? ObjsArray : [ObjsArray];

        if (!key_field ||
            key_field == null ||
            key_field == "") {
            return ObjsArray;
        }

        if(ObjsArray.length > 0){

            let arrayReOrganizado:any[] = [];
            let BufferConvertidor = {};

            //tranforma cada objeto colocando como propiedad principal el
            // campoRef de la siguiente manera:
            //{"campoRef1":{...data}, "campoRefUnico2":{...data}}
            //muy parecido a como usa firebase los _id como referencia de campo
            //ya que en un objeto JSON nunca puede haber 2 campos con el mismo nombre
            for(let i in ObjsArray) {
                BufferConvertidor[ObjsArray[i][key_field]] = ObjsArray[i];
             }

             //reconstruye el array
             for(let i in BufferConvertidor) {
                arrayReOrganizado.push(BufferConvertidor[i]);
             }
              return arrayReOrganizado;

        }else{
            return ObjsArray;
        }
    }    
}
