import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

export const Router = new VueRouter({
    mode : "history",
    // base : process.env.BASE_URL,
    routes:[
        {
            path:"/",
            component : ()=> <any>import('../components/body1/body1').then(ts_Comp=>ts_Comp.VComponent)
        }
    ]
});
