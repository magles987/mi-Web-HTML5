//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████

/** 
 * *enum*  
 * descrip...  
 * 
*/
export enum EFieldType {

    //================================================================
    //PRIMITIVOS:

    /**valores booleanos */
    boolean = "boolean",
    /**valores numericos */
    number = "number",
    /**valores de texto */
    string = "string",
    /**valor de objeto especial almacenable 
     * en la BD.  
     * *Recordar:*  
     * cada BD gestiona diferente ese objeto.
     * En Firestore se almacenan tipos `timestamp`
     * En Mongo almacena el objeto Date completo
     */
    date = "date",
    /**Valor de objeto especial que permite 
     * almacenar MongoDB */
    RegExp = "RegExp",

    /**Representa valores de campos utiles 
     * para el sistema y normalmente tienen un 
     * prefijo `_` en su nombre (Ejemplo: *_id*, 
     * *_pathDoc*), estos valores NO necesitan
     * ser formateados.  
    */
    _system = "_system",

    //================================================================
    //ESTRUCTURA (OBJETOS, EMBEBIDOS Y REFERENCIAS):
    
    /**
     * indica que el campo contiene estructura de objetos 
     * que **NO** es un embebido.  
     * Estos campos especiales deben nombrarse con el 
     * prefijo `obj_` (para el caso de mongoDB) o `map_` 
     * para el caso de firestore
     */
    objectOrMap = "object-or-map",
    
    /**
     * indica que el campo hará referencia a subcolecciones 
     * (Firestore) o estructura embebida (MongoDB), que a 
     * la larga es lo mismo.  
     * Estos campos especiales deben nombrarse con el 
     * prefijo `emb_`
     */
    embedded = "embedded",    

    /**
     * indica que el campo almacena referencias (_id 
     * o _pathDoc o _docClone) de documentos de otras colecciones 
     * o subColecciones (las especificaciones deben ir en la 
     * configuracion de estructura)
     */
    foreign = "foreign",

    
}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/**interfaces independientes de metadata para cada 
 * tipo formtado de valores primitivos.
 * 
 * Se realiza asi para dar opcion de extender 
 * interfaces personalizando cada formato de 
 * valor primitivo en diferentes modelMeta
*/

/** @info <hr>  
 * *interface*
 * metadata para formatear valores booleanos
 * ____
 */
export interface IMetaFtBoolean {
}

/** @info <hr>  
 * *interface*
 * metadata para formatear valores numericos
 * ____
 */
export interface IMetaFtNumber {
    /**Determina si se usa como booleano numerico */
    isNumberBoolean: boolean;
    /** Determina el rango entre positivos y negativos: 
     * *Type:*  
     * `+` : solo positivos.  
     * `-` : solo negativo.    
     * `+/-` : ambos
    */
    typeZ: "+" | "-" | "+/-";
    /** utilidad que determina como redondear 
     * el numero y cuantos decimales asignar.  
     * si es null, no ejecuta ajuste.  
     * **Recordar:** Siempre debe ser enteros.  
     * 
     * Formato:  
     * Enteros Positivos:  
     * expFactor = 0 indica redondeo predefinido 
     * por la libreria Math o que es un campo 
     * usado como boolean numerico para Firestore.  
     * 
     * expFactor = 1 indica redondeo en decenas  
     * expFactor = 2 indica redondeo en centenas  
     * expFactor = 3 indica redondeo en Miles  
     * ...  
     * Enteros Negativos:  
     * expFactor = -1 indica redondeo en decimas  
     * expFactor = -2 indica redondeo en centesimas  
     * expFactor = -3 indica redondeo en Milesimas  
     * ...  
     */
    expFactorRoundDecimal: number | null;
    /** Determina el tipo de redondeo deseado: 
     * *Type:*  
     * `none` : no se redondea.  
     * `round` : redondeo estandar (arriba si es >=5 y abajo si es <5).    
     * `floor` : redondeo hacia abajo.  
     * `ceil` : redondeo hacia arriba.  
    */
    typeRoundOut: "none" | "round" | "floor" | "ceil";
}

/** @info <hr>  
 * *interface*
 * metadata para formatear valores de texto
 * ____
 */
export interface IMetaFtString {
    /** Determina si se debe realizar alguna capitalizacion 
     * en el texto, pasar de mayusculas a minusculas o al 
     * contrario, o colocar la primera letra en Mayuscula 
     */
    typeCase?: "UpperCase" | "LowerCase" | "CapitalizeFirstCase"

    /** Formateo Especial a partir de expresiones regulares 
     * construidas desde string 
     */
    f_RemplaceForRegExp?: {
        strRegExp: string;
        strReplace: string;
    }[];
}

/** @info <hr>  
 * *interface*
 * metadata para formatear valores de fecha
 * de acuerdo a cada BD
 * ____
 */
export interface IMetaFtDate {
    //..aqui la metadata
}

/** @info <hr>  
 * *interface*
 * metadata para formatear valores de 
 * expresion regular de acuerdo a cada 
 * para mongoBD
 * ____
 */
export interface IMetaFtRegExp {
    //..aqui la metadata
}


//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *interface*
 * Interfaz con metadatos (banderas y configuracion) 
 * para cada campo de cada *Model*
 * ____
 * *Types:*  
 * `TField` : el tipado asiganado para dicho campo en *Model*, 
 * sin embargo si el campo no es *primitive* y es un objeto  (*map_* o 
 * *mapA* o *mapClon_* o *obj_* o *objA_* o *objClon_*) se debe tipar 
 * como la *Imap[model]* o *Iobj[model]* correspondiente. Si es 
 * referencial tipar como *any*. 
 * 
 * `TExtModelMeta` : si el campo es referencial (*emb_* o *fk_*) se debe
 * tipar con el *modelMeta* correspondiente de la coleccion o subcoleccion 
 * a la que haga referencia, si no tiparlo como *unknown*
 * ____
 */
export interface IFieldMeta<TField, TExtModelMeta>{

    /** 
     * nombre del campo (como referencia para string)
     * ____
     */
    nom : string;

    /** 
     * indica el valor inicial que debe tener el campo antes 
     * de manipular los datos, muy util para instanciar *model* 
     * con valores especiales (incluso estos valores 
     * potencialmente pueden ser solicitados asincronicamente)
     * 
     * **IMPORTANTE:**  
     * -> en el caso de los campos que contienen referencias
     * asi como `ETypeField.ForeignKey` , `ETypeField.mapClon` 
     * , `ETypeField.objectClon` el contenido de esta 
     * propiedad define la **cardinalidad** ((0a1,1a1) si el 
     * valor es sencillo o (0aMuchos, 1aMuchos) si es array).  
     * ->Esta bandera tiene referencias en strings  
     * vacios `""` asi que no se puede cambiar el nombre).
     * ____
     */
    default : TField;

    /**
     * el tipo dato que almacenara este campo, de 
     * acuerdo a las agrupaciones que recibe la 
     * base de datos
     */
    fieldType :EFieldType;

    /**
     * Determina si es un campo array, 
     * (simple, referencial o de objetos)
     */
    isArray? : boolean;

    /**
     * Determina si es un campo para calculos 
     * pero *NO* es almacenable en la BD
     */
    isVirtual? : boolean;

    /**
     * Configuracion especial para campos 
     * que contienen algun tipo de estructura 
     * o son referenciales
     */
    structureFConfig? : {

        /**
         * contiene una instancia de todo un 
         * modelMeta externo ( puede ser de destino 
         * a otra coleccion, una subcoleccion o una 
         * estructura como  *map_* u *obj_* ).
         * 
         * **Reordar:** si se requiere usar 
         * la misma instancia de este mismo 
         * modelMeta a modo de recursividad; 
         * **NO** se instancia directamente 
         * (por que entraria en un loop infinito)
         *  en su caso se debe usar `TExtModelMeta` 
         * de tipo *string* y usar el valor `"this"` 
         * que indicará que es una recursividad, 
         * externamente se debera asignar dicha 
         * recursividad, esto se hace ya que las 
         * clases modelMeta NO deben contener 
         * metodos ni propiedades de tipo *function*
         */
        extModelMeta: TExtModelMeta;   

        /**
         * Flag que determina si es un campo 
         * de tipo referencial ya sea por 
         * `EFieldType.foreignKey` o 
         * `EFieldType.foreignClone`
        */
        // isReferencial : boolean;

        /**
         * si el campo es referencial (que NO sea 
         * *objeto sencillo* o *map* o *embebido*) esta 
         * propiedad determina el tipo de referencia 
         * que almacenará el campo.  
         * `_pathDoc` : un string con la ruta exacta al documento 
         * referenciado (incluye el _id).  
         * `_docClone` : una copia (o extracto) del documento 
         * almacenado en otra coleccion (este clon de  documento 
         * debe tener al menos las propiedades _id y _pathDoc)
        */
        typeRef?:  "_pathDoc" | "_docClone";

        /**indica la cardinalidad (multiplicidad) del 
         * campo si el campo almacena:  
         * `"one"` --> [0a1,1a1].  
         * `"many"` --> [0aMuchos, 1aMuchos].  
         * para el tipo de referencia "_docClone" se puede usar 
         * "many" solo que se comporta de como array aplanado 
         * */
        cardinality? : "one" | "many";

    }

    /**Contiene la configuracion personalizada 
     * para formatear cada valor alacenado en 
     * cada campo 
     */
    formatFieldMeta : {
        /** Configuracion de formateo para valores booleanos*/
        ft_boolean?: IMetaFtBoolean;
        /** Configuracion de formateo para valores numericos, 
         * incluye el booleano numerico para Firestore*/
        ft_number?: IMetaFtNumber;
        /** Configuracion de formateo para valores texto en general*/
        ft_string?: IMetaFtString
        /** Configuracion de formateo para valores 
         * de fecha (tipo texto plano)*/
        ft_date?: IMetaFtDate;

        /** Configuracion de formateo para valores 
         * expresiones regulares **SOLO MONGODB**
        */
        ft_RegExp?: IMetaFtRegExp;    
    }

    //validadores es un array de objetos
    // 

    // validators?:{
    //     validator:IValidatorRequired |
    //               IValidatorMatch<TCampo> |
    //               IValidatorRange |
    //               IValidatorEnum<TCampo> |
    //               IValidatorAsync, 
    //     type:ETipoValidador, 
    //     msg:string}[];

    /** indica si el campo es obligatorio */
    isRequired?:boolean;

    /**si **NO** es `undefined` o `null`, indica que el campo puede 
     * seleccionar valores de una lista, tambien indica si se 
     * puede seleccionar 1 opcion o varias.  
     * **Recordar:** si `typeSelect = "multiple"`  el campo debe 
     * ser *array*
     */
    typeSelect?:"unica"|"multiple";  
    /**Si `typeSelect` esta configurada, se debe proporcionar 
     * la lista de opciones a escoger */
    selectList?:TField[];

}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** *var* `nomsModel_Dictionary`  
 * almacena los nombres de modelos y colecciones usados 
 * en el proyecto para acceso en tiempo de ejecucion.  
 * **Importante:**
 * las propiedades de este objeto estan en singular pero 
 * se les asigna un subObjeto con propiedades para 
 * determinar si se usa: 
 * 
 * *Singular:* `S`  
 * *Plural:* `P`
 * 
*/
export var nomsModel_Dictionary = {
    Rol : {S: "Rol", P:"Roles"},
    Usuraio : {S: "Usuario", P:"Usuarios"},

    Producto : {S: "Producto", P:"Productos"},
}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *interface* `IReqDataMeta`  
 * determina los campos a enviar en la peticion *onCall* 
 * a cloudFunctions
 * ____
 */
export interface IReqDataMeta {
    /**Nombre del modelo (singular) */
    __nomModel:string
}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** 
 * *enum*  
 * etiqueta los diferentes tipos de colecciones para 
 * asignar los metadatos
 * 
*/
export enum ETypeCollection {
    /**
     * determina que es una coleccion 
     * normal a nivel raiz
    */
   collection = "Collection",
    /**
     * indica que es una coleccion embebida 
     * (como lo denomna mongoDB) o subcoleccion 
     * (como lo denomina firestore). 
     */
    subCollection = "Embedded-subCollection",
    /**
     * indica que NO es una colecion en si,
     * es una estructura de objeto definido 
     * en un campo no prmitivo (*objects*, 
     * *map* o *array*) 
     */
    objectOnly = "Object-only",

}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/** @info <hr>  
 * *abstract class* `ModelMetadata`  
 * Factoriza propiedades comunes en la clases metadata 
 * de cada modelo asignado a cada coleccion de la BD
 * 
 * **Recomendable** no usar metodos en esta clase 
 * ni en sus hijas
 * ____
 */
export abstract class ModelMetadata {
    
    /** *abstract*   
     * contiene el nombre asignado al modelo (en singular)
     * ____
     */
    public abstract __nomModel: string;

    /** *abstract*   
     * contiene el nombre de la coleccion registrada en la BD (en plural)
     * ____
     */
    public abstract __nomColeccion: string;

    /** *abstract*   
     * determina  que tipo de coleccion es:  
     * `collection` : coleccion normal 
     * (coleccion a nivel raiz).  
     * `subCollection` : indica que es 
     * una coleccion embebida o sub coleccion.  
     * `objectOnly` : indica que NO es una 
     * colecion en si, es una estructura de objeto 
     * definido en un campo no prmitivo (*objects*, 
     * *map* o *array*)
     * ____
     */
    public abstract __typeCollection: ETypeCollection;


    /** nombre de la funcion almacenada en cloudFunction  
     * a llamar para actualizar la metadata
     * ____
     */
    public __getCloudFnMeta:string = "getFnMetadata"; 

    //================================================================    
    constructor(){}

}


