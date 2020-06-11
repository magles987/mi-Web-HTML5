//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*IUsuario:*/
//
export interface IUsuario<TExtend>{
    _id? : TExtend;  //_id personalizado creado por el modulo uuid
    _pathDoc? : TExtend; 

    nombre? : TExtend;
    apellido?: TExtend;
    email?: TExtend;
    telefono?: TExtend;

}

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*class Usuario implements IUsuario<any>*/
//
export class Usuario implements IUsuario<any> {

    _id:string;
    _pathDoc:string;
    nombre:string;
    apellido:string;
    email:string;
    telefono:string;
}