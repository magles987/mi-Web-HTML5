import Vue from 'vue'
import "./footer.css";

export var VComponent = Vue.extend({
    template:require("./footer.html"),
    data : function() {
        return new dataClase()
    }
})

class dataClase {
    campo1:string;
    constructor() {
        this.campo1 = "este es el pie";    
    }
}