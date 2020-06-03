import { Ifb_config, fb_dev, fb_prod } from "./_firebase-config";

//████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
/*class Environment*/
// todos las caracteristicas globales se trabaja aqui
export class Environment {

    constructor() {} //debe ser vacio

    private env_mode:"dev" | "prod" = "dev"; 

    private _firebaseConfig: Ifb_config;
    public get firebaseConfig(): Ifb_config {

        if (this.env_mode == "dev") {
            this._firebaseConfig = fb_dev;
        } 

        if (this.env_mode == "prod") {
            this._firebaseConfig = fb_prod;
        }
        return this._firebaseConfig;
    }

}
