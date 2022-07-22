import { LogType } from "../BE_types";


interface Logger {
    log: (message: string, logType?: LogType) => void;
}

//Helper functions!
const resetLogColor = () => console.log(`\u001b[1;0m`)
  
const logger: Logger = {
    log(message: string, logType: LogType = LogType.NORMAL) {

        console.log( `\u001b[1;31m ${`[${logType}] ${message}`}` ); //RED
        console.log( `\u001b[1;32m ${`[${logType}] ${message}`}` ); //GREEN
        console.log( `\u001b[1;33m ${`[${logType}] ${message}`}` ); //YELLOW
        console.log( `\u001b[1;34m ${`[${logType}] ${message}`}` ); //BLUE
        console.log( `\u001b[1;35m ${`[${logType}] ${message}`}` ); //PURPLE
        console.log( `\u001b[1;36m ${`[${logType}] ${message}`}` ); //CYAN
        //console.log( `\u001b[1;0m ${`[${logType}] ${message}`}` ); //DEFAULT

        resetLogColor();
    }
}
  
export default logger;