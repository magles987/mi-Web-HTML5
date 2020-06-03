import Vue from 'vue'
import "./body1.css";

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
    
    }
}