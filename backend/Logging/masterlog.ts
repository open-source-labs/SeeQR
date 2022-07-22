import { LogType } from "../BE_types";


interface Logger {
    log: (message: string, logType?: LogType, opt1?: any, opt2?: any) => void;
}

//Helper functions!
const resetLogColor = () => console.log(`\u001b[1;0m`)
const saveLogMessage = (message) => {
    const time = new Date().toLocaleDateString('en-US', {timeZone: 'UTC'});
}

//Export
const logger = function(message: string, logType: LogType = LogType.NORMAL, opt1?, opt2?) {
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
        
        case LogType.RECEIVE: //BLUE
            colorCode = 34;
            logString = 'SERVER_IPC_RECEIVE';
            break;

        case LogType.SEND: //MAGENTA
            colorCode = 35;
            logString = 'SERVER_IPC_SEND';
            break;

        case LogType.NORMAL: //WHITE (And change logType string)
            colorCode = 0;
            logString = 'LOG';
            break;

        default:
            colorCode = 0;
            break;
    }

    let moreText = '';

    if(opt1) moreText += JSON.stringify(opt1);
    if(opt2) moreText += JSON.stringify(opt2);

    console.log( `\u001b[1;${colorCode}m ${`[${logType}] ${message + moreText}`}` + `\u001b[1;0m`);
    // resetLogColor();
    saveLogMessage(`[${logType}] ${message}`);
}
  
export default logger;