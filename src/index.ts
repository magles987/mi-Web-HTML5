//con el fin de organizar el codigo independizando totalmente 
// los archivos typescript con los de javascript y en vista 
// que se requiere la ubicacion de este archivo index.js en la 
// raiz de src/  (esto para poder importar modulos de css y scss) 
// lo que se hace es que este archivo index.js sea un puente que 
// solo ejecute la funcion main que inicia toda la app (algo 
// parecido al metodo de entrada de java)

import { main } from "./ts/main"

main();

