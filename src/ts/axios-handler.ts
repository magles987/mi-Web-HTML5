import axios, { AxiosInstance } from "axios";
import { FirebaseConfig, host } from "./firebase-config/firebase-config";
import { ENV } from "./environment";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*class AxiosHandler*/
//
export class AxiosHandler {

    private axiosIns:AxiosInstance
    private static instance:AxiosHandler;

    constructor() {
        const app_fb = FirebaseConfig.getInstance();
        const baseURL = (ENV().firebase.isLocalCloudFunctions) ? 
                        `${host.Emu_CloudFunctions}/${}`: ;
        this.axiosIns = axios.create({
            
        })
    }

    /*getInstance()*/
    //obtener una instancia UNICA (singleton)
    public static getInstance():AxiosHandler{
        if (!AxiosHandler.instance) {
            AxiosHandler.instance = new AxiosHandler();
        }
        return AxiosHandler.instance;
    }

    /*getAxiosInstanceForCloudFn()*/
    //
    //Parametros:
    //
    public static getAxiosInstanceForCloudFn():AxiosInstance{
        const app_fb = FirebaseConfig.getInstance();
        const baseURL = (ENV().firebase.isLocalCloudFunctions) ? 
                        `${host.Emu_CloudFunctions}/${}`: ;
        return axios.create({
            
        })
    }
    

}
