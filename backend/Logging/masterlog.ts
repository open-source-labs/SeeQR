import { LogType } from "../BE_types";


interface Logger {
    log: (message: string, logType?: LogType) => void;
}

//Helper functions!
const resetLogColor = () => console.log(`\u001b[1;0m`)
const saveLogMessage = (message) => {
    const time = new Date().toLocaleDateString('en-US', {timeZone: 'UTC'});
}

//Export
const logger = function(message: string, logType: LogType = LogType.NORMAL) {
    //Code for the log color
    let colorCode = 0;

    //Prefix for the message
    let logString: any = logType;

    switch(logType) {
        case LogType.ERROR: //RED
            colorCode = 31;
            break;
        
        case LogType.SUCCESS: //GREEN
            colorCode = 32;
            break;
        
        case LogType.WARNING: //YELLOW
            colorCode = 33;
            break;
        
        case LogType.SEND: //BLUE
            colorCode = 34;
            break;

        case LogType.SEND: //MAGENTA
            colorCode = 35;
            break;

        case LogType.NORMAL: //WHITE (And change logType string)
            colorCode = 0;
            logString = 'LOG';
            break;

        default:
            colorCode = 0;
            break;
    }

    console.log( `\u001b[1;${colorCode}m ${`[${logType}] ${message}`}` );
    resetLogColor();
    saveLogMessage(`[${logType}] ${message}`);
}
  
export default logger;