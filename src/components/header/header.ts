import Vue from 'vue'
import "./header.css";

export var VComponent = Vue.extend({
    template:require("./header.html"),
    data : function() {
        return new dataClase()
    }
})

class dataClase {
    campo1:string;
    constructor() {
        this.campo1 = "Titulo desde comp vue";
        setTimeout(() => {
            this.campo1 = "Algo totalmente diferente";
        }, 10000);
    
    }
}

// export function precarga() {
//     let modulos = document.getElementsByTagName("modules");
//     let f = require("./header.html");
//     modulos.item(0).innerHTML = f
// }