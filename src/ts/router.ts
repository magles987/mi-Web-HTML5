import Vue from 'vue';
import VueRouter from 'vue-router';

//activar uso de rutas
Vue.use(VueRouter);

/** Instancia que contiene la configuracion de las rutas globales*/
export const Router = new VueRouter({
    /** */
    mode : "history",
    // base : process.env.BASE_URL,

    /**  */
    routes:[
        {
            path:"/",
            component : ()=> <any>import('../components/body1-c/body1-c').then(ts_Comp=>ts_Comp.Body1Component.getVueComponent())
        }
    ]
});
