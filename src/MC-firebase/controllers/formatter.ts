import { IFieldMeta, EFieldType, IMetaFtNumber, IMetaFtBoolean, IMetaFtString, IMetaFtDate, IMetaFtRegExp, ModelMetadata } from "./meta";
import { UtilControllers } from "./util-ctrl";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *abstract class*  
 * permite formatear los valores de los campos de un documento 
 * de forma estandar y basandose en la propiedad formatter 
 * de la metadata de cada modelo 
 * ____
 */
export abstract class Formatter {

    /**Utilidades del controlador */
    private utilCtrl:UtilControllers;

    /** 
     * `constructor()`  
     * descrip...
     * 
     * *Param:*  
     * `` 
     * ____
     */
    constructor() {
        this.utilCtrl = UtilControllers.getInstance();
    }

    /** 
     * *public*  
     * permite formatear y eliminar campos que no seran 
     * almacenados en la base de datos (como los campos 
     * virtuales)
     * 
     * *Param:*  
     * `doc` : el documento a formatear (tambien seria 
     * el *map* a formatear si se esta usando 
     * recursivamente).  
     * `modelMeta` : la metadata correspondiente al modelo, 
     * usada para analizar los campos almacenables.  
     * `isStrongUpdate` : indica si se desea que los maps 
     * (por ahora solo los maps sencillos) se les realice 
     * "edicion fuerte" lo que indica que se reemplazan 
     * TODOS los campos del map sin excepcion, en la edicion 
     * debil (predefinida) solo se modifican los 
     * campos del map que realmente hayan tenido cambio 
     * de valor.  
     * `nomPath` : es necessario **solo en llamados recursivo**.   
     * Indica la ruta que se desea agregar a los campos de los 
     * *map* a editar por medio de una ruta:  
     * ```typescript
     * "map_campo.subcampo1.subcampo11.subcampoN"  
     * ```
     * por lo tanto desde un llamado externo al recursivo se 
     * debe dejar con el valor predeterminado de  `""`
     * ____
     * *Types:*  
     * `TModel, TModelMeta` : son T genericos autointuitivos 
     * por el metodo
     * ____
     */
    public formatDoc<TModel, TModelMeta>(
        doc:TModel, 
        modelMeta:TModelMeta,
        isStrongUpdate = false, 
        nomPath = ""
    ):TModel{
        //se asignan los objetos tipados a variables temporales
        //de tipo any para usar caracteristicas fuera de typescript
        let mod_M = <any> modelMeta;
        let DocResult = <TModel>{};

        for (const keyField in doc) {
            for (const key_FieldMeta in mod_M) {
                
                /*Determinar campos tipo propiedad */
                if (keyField == key_FieldMeta && 
                    typeof doc[keyField] != 'function' &&  
                    typeof doc[key_FieldMeta] != 'function' &&
                    key_FieldMeta != "constructor" 
                ) {

                    //metadata del campo
                    const fieldMeta = <IFieldMeta<unknown, unknown>>mod_M[key_FieldMeta];
                    
                    //retirar los campos virtuales
                    if (fieldMeta.isVirtual) {
                        continue;
                    }

                    /*Tratamiento de formateo a embebidos o subColecciones */
                    if (fieldMeta.fieldType == EFieldType.embedded) {
                        //Los campos embebido NO pueden agregarse a firestore
                        //desde la coleccion padre, deben ser agregado o modificado
                        //desde la propia subcoleccion
                        continue;
                    }

                    /*tratamiento de referencial por _id o _pathDoc */
                    if (fieldMeta.fieldType == EFieldType.foreign) {
                        /*asigna directamente (no se formatean las referencias fk_)*/
                        DocResult[keyField] = doc[keyField];
                        continue;        
                    }
                    
                    /*tratamiento de estructura simple */
                    if (fieldMeta.fieldType == EFieldType.objectOrMap) {

                        const ext_MMeta = fieldMeta.structureFConfig.extModelMeta;

                        if (fieldMeta.isArray) {

                            //IMPORTANTE: al 07/19 Firestore NO permite ediciones sobre elementos
                            //de un array por lo tanto toda edicion se hace de caracter fuerte
                            //TODOS los elementos del array seran REEMPLAZADOS o ELIMINADOS

                            const sDocs = <any[]><unknown>doc[keyField];
                            const raDocs = sDocs.map((d)=>this.formatDoc(d, ext_MMeta));
                            DocResult[keyField] = <any>raDocs;                        
                            
                        }else{
                            if (isStrongUpdate) {
                                DocResult = Object.assign(DocResult, this.formatDoc(doc[keyField], ext_MMeta, isStrongUpdate, `${nomPath}${keyField}.`));
                            } else {
                                DocResult[keyField] = <any>this.formatDoc(doc[keyField], ext_MMeta);
                            }    
                        }

                        continue;                              
                    }                    

                    //...aqui mas campos especiales a formatear...

                    //formatear campos primitivos (o array de primitivos)
                    if (fieldMeta.isArray) {

                        const aDoc = <any[]><unknown>doc[keyField];
                        const raDoc = aDoc.map((v)=>this.formatValuesField(v, fieldMeta));
                        DocResult[keyField] = <any>raDoc;

                    }else{
                        if(isStrongUpdate){
                            DocResult[`${nomPath}${keyField}`] = this.formatValuesField(doc[keyField], fieldMeta);
                        }else{
                            DocResult[`${keyField}`] = this.formatValuesField(doc[keyField], fieldMeta);
                        }
                    }

                }
            }
        }

        return DocResult;
    }
    
    /** 
     * *public*  
     * permite formatear y eliminar campos que no seran 
     * almacenados en la base de datos (como los campos 
     * virtuales)
     * 
     * *Param:*  
     * `doc` : el documento a formatear (tambien seria 
     * el *map* a formatear si se esta usando 
     * recursivamente).  
     * `modelMeta` : la metadata correspondiente al modelo, 
     * usada para analizar los campos almacenables.  
     * `isStrongUpdate` : indica si se desea que los maps 
     * (por ahora solo los maps sencillos) se les realice 
     * "edicion fuerte" lo que indica que se reemplazan 
     * TODOS los campos del map sin excepcion, en la edicion 
     * debil (predefinida) solo se modifican los 
     * campos del map que realmente hayan tenido cambio 
     * de valor.  
     * `nomPath` : es necessario **solo en llamados recursivo**.   
     * Indica la ruta que se desea agregar a los campos de los 
     * *map* a editar por medio de una ruta:  
     * ```typescript
     * "map_campo.subcampo1.subcampo11.subcampoN"  
     * ```
     * por lo tanto desde un llamado externo al recursivo se 
     * debe dejar con el valor predeterminado de  `""`
     * ____
     * *Types:*  
     * `TModel, TModelMeta` : son T genericos autointuitivos 
     * por el metodo
     * ____
     */
    public formatDoc2<TModel, TModelMeta>(
        doc:TModel, 
        modelMeta:TModelMeta,
        isStrongUpdate = false, 
        nomPath = ""
    ):Promise<TModel>{
        //se asignan los objetos tipados a variables temporales
        //de tipo any para usar caracteristicas fuera de typescript
        let mod_M = <any> modelMeta;
        let DocResult = <TModel>{};

        let pResponseByFields:Promise<TModel>[] = [];

        for (const keyField in doc) {
            for (const key_FieldMeta in mod_M) {
                
                /*Determinar campos tipo propiedad */
                if (keyField == key_FieldMeta && 
                    typeof doc[keyField] != 'function' &&  
                    typeof doc[key_FieldMeta] != 'function' &&
                    key_FieldMeta != "constructor" 
                ) {

                    //metadata del campo
                    const fieldMeta = <IFieldMeta<unknown, unknown>>mod_M[key_FieldMeta];
                    
                    //retirar los campos virtuales
                    if (fieldMeta.isVirtual) {
                        continue;
                    }

                    /*Tratamiento de formateo a embebidos o subColecciones */
                    if (fieldMeta.fieldType == EFieldType.embedded) {
                        //Los campos embebido NO pueden agregarse a firestore
                        //desde la coleccion padre, deben ser agregado o modificado
                        //desde la propia subcoleccion
                        continue;
                    }

                    /*tratamiento de referencial por _id o _pathDoc */
                    if (fieldMeta.fieldType == EFieldType.foreign) {
                        pResponseByFields.push(
                            Promise.resolve()
                            .then(()=>{
                                /*asigna directamente (no se formatean las referencias fk_)*/
                                DocResult[keyField] = doc[keyField];
                                return DocResult;
                            })
                        );
                        continue;        
                    }
                    
                    /*tratamiento de estructura simple */
                    if (fieldMeta.fieldType == EFieldType.objectOrMap) {

                        const ext_MMeta = fieldMeta.structureFConfig.extModelMeta;

                        if (fieldMeta.isArray) {
                            
                            //IMPORTANTE: al 07/19 Firestore NO permite ediciones sobre elementos
                            //de un array por lo tanto toda edicion se hace de caracter fuerte
                            //TODOS los elementos del array seran REEMPLAZADOS o ELIMINADOS

                            const sDocs = <any[]><unknown>doc[keyField];
                            let pAObjOrMap = sDocs.map((sD)=>this.formatDoc2(sD, ext_MMeta));
                            
                            pResponseByFields.push(
                                Promise.all(pAObjOrMap)
                                .then((absObjOrMapDocs) => {
                                    DocResult[`${keyField}`] = absObjOrMapDocs;
                                    return DocResult;
                                })
                            );                   
                            
                        }else{

                            pResponseByFields.push(

                                Promise.resolve()
                                .then(()=>{
                                    if (!isStrongUpdate || isStrongUpdate == null) {
                                        return <Promise<TModel>><unknown>this.formatDoc2(doc[keyField], ext_MMeta);
                                    
                                    } else {
                                        return this.formatDoc2(doc[keyField], ext_MMeta, isStrongUpdate, `${nomPath}${keyField}.`)
                                        .then((doc)=>{
                                            //reemplazo fuerte
                                            return Object.assign(DocResult, doc);
                                        });                                
                                    }
                                })
                            );

                        }
                        continue;                              
                    }                    

                    //...aqui mas campos especiales a formatear...

                    //formatear campos primitivos (o array de primitivos)
                    if (fieldMeta.isArray) {

                        const aDoc = <any[]><unknown>doc[keyField];
                        const pA = aDoc.map((aD)=> {                     
                            //---formatValuesField() se cambiara en un futuro a promesa---
                            return Promise.resolve(this.formatValuesField(aD, fieldMeta))    
                        });

                        pResponseByFields.push(
                            Promise.all(pA)
                            .then((absArrayValues)=>{
                                DocResult[`${keyField}`] = absArrayValues;
                                return DocResult;
                            })
                        );
                        

                    }else{
                        pResponseByFields.push(
                            Promise.resolve()
                            .then(()=>{

                                 //---formatValuesField() se cambiara en un futuro a promesa---
                                const pFormat = Promise.resolve(this.formatValuesField(doc[keyField], fieldMeta));

                                //---[POSIBLE ERRORES]---
                                if(isStrongUpdate){
                                   
                                    return pFormat
                                        .then((fv) => {
                                            DocResult[`${nomPath}${keyField}`] = fv;
                                            return DocResult;
                                        });

                                }else{

                                    return pFormat
                                        .then((fv) => {
                                            DocResult[`${keyField}`] = fv;
                                            return DocResult;
                                        });  

                                }
                            })
                        );
                    }

                }
            }
        }

        return Promise.all(pResponseByFields)
        .then((abstractArray_Doc)=>{
            /*abstractArray_Doc  es el documento ya formateado 
            pero Promise.all() regresa un array del mismo documento 
            repetido tantas veces como promesas se hayan creado 
            por lo tanto es necesario devolver solo 1 de dichos 
            documentos*/
            if (Array.isArray(abstractArray_Doc) 
                && abstractArray_Doc.length == 0
            ) {
                return Promise.reject("Error desconocido al formatear el documento")
            }

            return abstractArray_Doc[0];
        });
    }
        
    /** 
     * *public*  
     * descrip...
     * 
     * *Param:*  
     * `doc` : el documento a formatear.  
     * `modelMeta` : la metadata correspondiente al modelo, 
     * usada para analizar los campos almacenables.  
     * `_pathBase` : si es un subdocumentos (perteneciente 
     * a una subcoleccion) se debe recibir el *_pathBase* .  
     * `ext_id` : si se desea usar un *_id* de fuente externa.  
     * `isStrongUpdate` : indica si se desea que los maps 
     * (por ahora solo los maps sencillos) se les realice 
     * "edicion fuerte" lo que indica que se reemplazan 
     * TODOS los campos del map sin excepcion, en la edicion 
     * debil (predefinida) solo se modifican los 
     * campos del map que realmente hayan tenido cambio 
     * de valor.  
     * ____
     */
    public formatDocWithPromise<TModel, TModelMeta>(
        doc:TModel, 
        modelMeta:TModelMeta,
        _pathBase = "",               
        ext_id?:any,
        isStrongUpdate = false
    ):Promise<TModel>{
        //formateo basico sincrono:
        // doc = this.formatDoc(doc, modelMeta, isStrongUpdate);

        //...aqui si se desea algun formateo que requiera asyncronismo        
        return Promise.resolve()
        //formateo de campos asyncronico
        .then(()=>this.formatDoc2(doc, modelMeta, isStrongUpdate))
        
        /*settear campos especiales de forma asyncrona */
        //settear _id:
        .then((doc)=>this.set_id(doc, ext_id))
        .then((doc)=>this.set_pathDoc(doc, modelMeta, _pathBase));
    }

    /** 
     * *public*  
     * formatea el valor **primitivo** de un solo campo.
     *  
     * *Param:*  
     * `valueField` : Recibe el **valor primitivo** 
     * que almacena el campo. En campos con tipo 
     * especiales de objeto como: *map*, *mapArray*,
     *  *obj*, *objArray*, es necesario enviar el 
     * valor primitivo de cada elemento (para el 
     * caso de los *array*) o del subcampo (en el 
     * caso de los *obj_* o *map_*).  
     * 
     * `fieldMeta` : la metadata enfocada la campo.
     * 
     * *Types:*  
     * `TField` : tipado implicito dentro del mismo parametro
     * ____
     */
    public formatValuesField<TField>(
        value:TField,
        fieldMeta:IFieldMeta<TField, unknown>
    ):TField {
        //comprobar existencia
        if (!value || 
            value == null ||
            !fieldMeta || fieldMeta == null ||
            !fieldMeta.fieldType || fieldMeta.fieldType == null ||
            !fieldMeta.formatFieldMeta || fieldMeta.formatFieldMeta == null 
        ) {
            return value;
        }

        const fieldFormatMeta = fieldMeta.formatFieldMeta;
;
        switch (fieldMeta.fieldType) {

            case "boolean":
                if (typeof value != "boolean") {
                    return value;
                }
                //el campo contiene valor booleano
                let b_vf = <boolean>value;
                //...aqui algun tipo de formato si es que exist para el boolean
                return <TField><unknown>this.formatVBoolean(value, fieldFormatMeta.ft_boolean);
                break;

            case "number":

                if (!fieldFormatMeta.ft_number || 
                    fieldFormatMeta.ft_number != null || 
                    typeof value != "number"
                ) {
                    return value;
                }
                return <TField><unknown>this.formatVNumber(value, fieldFormatMeta.ft_number);
                break;      

            case "string":

                if (!fieldFormatMeta.ft_string || 
                    fieldFormatMeta.ft_string != null || 
                    typeof value != "string"
                ) {
                    return value;
                }
                
                return <TField><unknown>this.formatVString(value, fieldFormatMeta.ft_string );
                break;

            case "date":

                if (!fieldFormatMeta.ft_date || 
                    fieldFormatMeta.ft_date != null 
                ) {
                    return value;
                }

                return this.formatVDate(value, fieldFormatMeta.ft_date);
                break;                 
            
            case "RegExp":
                if (!fieldFormatMeta.ft_RegExp || 
                    fieldFormatMeta.ft_RegExp != null 
                ) {
                    return value;
                }
                return this.formatVRegExp(value, fieldFormatMeta.ft_RegExp);
                break;    

            case "_system":
                //los valores de campos "_system" por 
                //ahora No se formatean
                return value;
                break;          

            //campo especial
            default:
                return value;
                break;
        }
    }

    /** 
     * *public*  
     * realiza el formateo comun para dato o valor 
     * de tipo booleano y permite agregar (si se 
     * desea y de acuerdo a la interface *I[Model]MetaFtBoolean*) 
     * un formateo personalizado para cada *model*  
     * 
     * *Param:*  
     * `value` :  el valor a formatear.  
     * `metaFormat` : la metadata para 
     * formatear el valor
     * ____
     */
    public formatVBoolean(value:boolean, metaFormat:IMetaFtBoolean):boolean{
        //si me invento alguna forma de formatear un booleano
        return value;
    }

    /** 
     * *public*  
     * realiza el formateo comun para dato o valor 
     * de tipo numerico y permite agregar (si se 
     * desea y deacuerdo a la interface *I[Model]MetaFtNumber*) 
     * un formateo personalizado para cada *model*  
     * 
     * *Param:*  
     * `value` :  el valor a formatear.  
     * `metaFormat` : la metadata para 
     * formatear el valor
     * ____
     */
    public formatVNumber(value:number, metaFormat:IMetaFtNumber):number{

        //si se usa numberBoolean garantizar las opciones 0 o 1
        if (metaFormat.isNumberBoolean && metaFormat.isNumberBoolean == true) {
            value = (value <= 0) ? 0: value;
            value = (value >= 1) ? 1: value;
            return value;
        }

        //determinar rangos de positivos o negativos
        if (metaFormat.typeZ) {                
            switch (metaFormat.typeZ) {
                case "+":
                    value = (value>=0) ? value : -value;
                    break;
                case "-":
                    value = (value<0) ? value : -value;
                    break;  
                                          
                case "+/-":
                default:
                    value = value;
                    break;
            }   
        }

        //ajustar y redondear decimales
        value = this.formatDecimalSetting(metaFormat.typeRoundOut, value, metaFormat.expFactorRoundDecimal);
        return value;
    }

    /** 
     * *public*  
     * realiza el formateo comun para dato o valor 
     * de tipo texto y permite agregar (si se 
     * desea y de acuerdo a la interface *I[Model]MetaFtString*) 
     * un formateo personalizado para cada *model*  
     * 
     * *Param:*  
     * `value` :  el valor a formatear.  
     * `metaFormat` : la metadata para 
     * formatear el valor
     * ____
     */
    public formatVString(value:string, metaFormat:IMetaFtString):string{
        //trim por defecto
        value = value.trim();

        //determinar si tiene capitalizacion de texto
        if (metaFormat.typeCase) {
            switch (metaFormat.typeCase) {
                case "UpperCase":
                    value = value.toLowerCase();
                    break;
                case "LowerCase":
                    value = value.toLowerCase();
                    break;
                case "CapitalizeFirstCase":
                    value = value.replace(/^\w/, (c) => c.toUpperCase());
                    break;
                default:
                    break;
            }
        }

        //formateo basado en Expresiones regulares
        if (metaFormat.f_RemplaceForRegExp) {
            const a_RegExp = metaFormat.f_RemplaceForRegExp;
            for (let i = 0; i < a_RegExp.length; i++) {
                const regExp = new RegExp(a_RegExp[i].strRegExp);
                const strReplace = a_RegExp[i].strReplace;
                value = value.replace(regExp, strReplace);
            }
        }
        return value;
    }

    /** 
     * *public*  
      * realiza el formateo comun para dato o valor 
     * de tipo fecha (de acuerdo a la BD usada) y  
     * permite agregar (si se desea y de acuerdo a 
     * la interface *I[Model]MetaFtDate*) 
     * un formateo personalizado para cada *model* 
     * 
     * *Param:*  
     * `value` :  el valor a formatear.  
     * `metaFormat` : la metadata para 
     * formatear el valor
     * ____
     */
    public formatVDate(value:any, metaFormat:IMetaFtDate):any{
        //------[TO DO]-------
        return value;
    }

    /** 
     * *public*  
     * realiza el formateo comun para dato o valor 
     * de tipo expresion regular (solo mongoDB) y permite 
     * agregar (si se desea y de acuerdo a la interface  
     * *I[Model]MetaFtRegExp*) un formateo personalizado 
     * para cada *model*  
     * 
     * *Param:*  
     * `value` :  el valor a formatear.  
     * `metaFormat` : la metadata para 
     * formatear el valor
     * ____
     */
    public formatVRegExp(value:any, metaFormat:IMetaFtRegExp):any{
        //------[TO DO]-------
        return value;
    }

    //================================================================
    /**Setteadores para campos especiales */

    /** 
     * *protected*  
     * settea el campo especial de _id, siempre y 
     * cuando no tenga ya asignado un _id (que 
     * pueda ser personalizado) 
     * el setteo se hace de modo asyncrono 
     * (por si se requeriria setteo externo mas adelante)
     * 
     * *Param:*  
     * `doc` : documento a settear campo especial.  
     * ____
     */
    protected set_id<TModel>(doc:TModel, ext_id?:any):Promise<TModel>{

        if (
            /*determina si ya esta setteado */
            doc["_id"] &&
            doc["_id"] != null &&
            doc["_id"] != "" &&
            /*determina si no hay un _id externo 
            que tenga prioridad para sobreescribirlo */
            (!ext_id || ext_id == null)
            ) {
            return Promise.resolve(doc);
        }
    
        /*determina que _id se settea si 
        el autocreado o el externo */
        if (!ext_id || ext_id == null) {
            doc["_id"] = this.utilCtrl.createIds();
        } else {
            doc["_id"] = ext_id;
        }
        
        return Promise.resolve(doc);
    }    

    /** 
     * *protected*  
     * settea el campo especial de _pathDoc de modo asyncrono 
     * (por si se requeriria setteo externo mas adelante)
     * 
     * *Param:*  
     * `doc` : documento a settear campo especial.  
     * `modelMeta` : metadata para acceder a la 
     * ruta y mombre de la coleccion.  
     * `config` : Configuracion del Hook para 
     * acceder al pathBase   
     * ____
     */
    protected set_pathDoc<TModel,TModelMeta>(
        doc: TModel,
        modelMeta: TModelMeta,
        _pathBase = ""
    ):Promise<TModel>{

        //determinar si ya se settio
        if (doc["_pathDoc"] &&
            doc["_pathDoc"] != null &&
            doc["_pathDoc"] != ""
            ) {
            return Promise.resolve(doc);
        }
        
        //extraer part de modelo meta
        const mMeta = <ModelMetadata><unknown>modelMeta;
        
        doc["_pathDoc"] = (_pathBase === "") ?
                            `${mMeta.__nomColeccion}/${doc["_id"]}` :
                            `${_pathBase}/${mMeta.__nomColeccion}/${doc["_id"]}`;
        
        return Promise.resolve(doc);
    }


    //================================================================
    /**Utilitarios */

    /** 
     * *public*  
     * redondea un numero y ajusta decimales, tomado del 
     * sitio oficial:  
     * https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Math/round
     * 
     * *Param:*  
     * `type` :  Tipo de redondeo:  
     * (*none* sin redondeo)  
     * (*round* redondeo estandar (arriba si es >=5 y abajo si es <5))    
     * (*floor* redondeo hacia abajo)    
     * (*ceil* redondeo hacia arriba)      
     * `numValue` :  el numero a redondear (aunque si no es numero 
     * valido no ejecuta redondeo).  
     * `exp` : el factor exponencial a redondear
     * Formato:  
     * Enteros Positivos:  
     * `exp = 0` indica redondeo predefinido 
     * por la libreria Math o que es un campo 
     * usado como boolean numerico para Firestore.  
     * 
     * `exp = 1` indica redondeo en decenas  
     * `exp = 2` indica redondeo en centenas  
     * `exp = 3` indica redondeo en Miles  
     * ...  
     * Enteros Negativos:  
     * `exp = -1` indica redondeo en decimas  
     * `exp = -2` indica redondeo en centesimas  
     * `exp = -3` indica redondeo en Milesimas  
     * ...  
     * ____
     */
    public formatDecimalSetting(
        type: "none" | "round" | "floor" | "ceil", 
        numValue:any, 
        exp:number
    ):number{

        //si no se desea redondear
        if(type == "none" || !type || type == null){
            return numValue;
        }

        //determinar si  exp no esta definido para que
        //no haga ninguna operacion
        if(typeof exp === 'undefined' || exp==null){
            return numValue;
        }

        // Si el exp es cero...
        if (+exp === 0) {
            return Math[type](numValue);
        }
        numValue = +numValue; //+numValue intentar convertir a numero cualquier cosa
        exp = +exp; //+exp intentar convertir a numero culaquier cosa

        // Si el valor no es un número o el exp no es un entero...
        if (isNaN(numValue) || !(typeof exp === 'number' && exp % 1 === 0)) {
            throw new Error("not round" + numValue);
        }
        // Shift
        numValue = numValue.toString().split('e');
        numValue = Math[type](+(numValue[0] + 'e' + (numValue[1] ? (+numValue[1] - exp) : -exp)));
        // Shift back
        numValue = numValue.toString().split('e');
        numValue = +(numValue[0] + 'e' + (numValue[1] ? (+numValue[1] + exp) : exp));
        return numValue;
    } 

}