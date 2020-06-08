//████████████████████████████████████████████████████████████████
//interfaz referencial
export interface IProducto<TExtend>{
    _id? : TExtend;  //_id personalizado creado por el modulo uuid
    _pathDoc? : TExtend; 

    nombre? : TExtend
    precio? : TExtend;
    categoria? : TExtend;

    map_miscelanea? : IMap_miscelanea<TExtend> | any; 
    mapA_misc?: IMapA_misc<TExtend> | any;

    emb_SubColeccion?:TExtend;

    v_precioImpuesto?:TExtend;

}

export interface IMap_miscelanea<TExtend>{
    tipo? : TExtend;
    ruedas? : TExtend;
}

export interface IMapA_misc<TExtend>{
    color?:TExtend;
}

//████████████████████████████████████████████████████████████████
//clase referencial
