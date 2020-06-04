import Vue from 'vue'
import "./body1.scss";

import { Fb_app } from "../../ts/firebase-config";

export var VComponent = Vue.extend({
    template:require("./body1.html"),
    data : function() {
        return new dataClase()
    }
})

class dataClase {
    campo1:string;
    constructor() {
        this.campo1 = "Body1";
        setTimeout(() => {
            this.campo1 = "Algo totalmente diferente en Body1";
        }, 10000);
    
        let data:any;
        Fb_app.firestoreReady()
        .then(() => {
            return Fb_app.firestore()
            .collection('Productos')
            .orderBy('_id', 'asc')
            .limit(50)
            .get();

        })
        .then((d) => {
            return d.forEach((doc) => {
                console.log(doc.data());
            });
        });


    }
}