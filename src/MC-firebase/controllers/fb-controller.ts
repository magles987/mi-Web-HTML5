//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*class Fb_Controller*/
//
export class Fb_Controller {

    constructor() {}

    /*getAllDocs()*/
    //
    //Argumentos:
    //Query: Cursor
    protected getAllDocs(Query:firebase.firestore.Query<firebase.firestore.DocumentData>){
        return Query.get()
    }

}
