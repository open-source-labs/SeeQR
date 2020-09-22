"use strict";
// main.js is the entry point to the main process (the node process)
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import parts of electron to use
var electron_1 = require("electron");
var path_1 = require("path");
var url_1 = require("url");
var exec = require('child_process').exec;
var appMenu = require('./mainMenu');
var db = require('./modal');
var path = require('path');
var createInsertQuery = require('./dummy_db/dummy_handler');
/************************************************************
 ********* CREATE & CLOSE WINDOW UPON INITIALIZATION *********
 ************************************************************/
// Keep a global reference of the window objects, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow;
var mainMenu = electron_1.Menu.buildFromTemplate(require('./mainMenu'));
// Keep a reference for dev mode
var dev = false;
if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'development') {
    dev = true;
}
// Create browser window
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1800,
        height: 1400,
        minWidth: 900,
        minHeight: 720,
        title: 'SeeQR',
        show: false,
        webPreferences: { nodeIntegration: true, enableRemoteModule: true },
        icon: path.join(__dirname, '../../frontend/assets/images/seeqr_dock.png'),
    });
    if (process.platform === 'darwin') {
        electron_1.app.dock.setIcon(path.join(__dirname, '../../frontend/assets/images/seeqr_dock.png'));
    }
    // Load index.html of the app
    var indexPath;
    if (dev && process.argv.indexOf('--noDevServer') === -1) {
        indexPath = url_1.format({
            protocol: 'http:',
            host: 'localhost:8080',
            pathname: 'index.html',
            slashes: true,
        });
        mainWindow.webContents.openDevTools();
        // splashWindow.webContents.openDevTools();
        electron_1.Menu.setApplicationMenu(mainMenu);
    }
    else {
        // In production mode, load the bundled version of index.html inside the dist folder.
        indexPath = url_1.format({
            protocol: 'file:',
            pathname: path_1.join(__dirname, '../dist', 'index.html'),
            slashes: true,
        });
    }
    mainWindow.loadURL(indexPath);
    // Don't show until we are ready and loaded
    mainWindow.once('ready-to-show', function () {
        //ipcMain.send('open-splash', (event:any, {openSplash: boolean})=>{{openSplash: true}})
        mainWindow.show();
    });
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
// Invoke createWindow to create browser windows after
// Electron has been initialized.Some APIs can only be used
// after this event occurs.
electron_1.app.on('ready', createWindow);
// Quit when all windows are closed.
electron_1.app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
/************************************************************
 *********************** IPC CHANNELS ***********************
 ************************************************************/
// Listen for files upload
/* ---IMPORT DATABASE: CREATE AN INSTANCE OF DATABASE FROM A PRE-MADE .TAR OR .SQL FILE--- */
electron_1.ipcMain.on('upload-file', function (event, filePaths) {
    console.log('file paths sent from renderer', filePaths);
    var isMac = process.platform === 'darwin';
    var db_name;
    if (isMac) {
        db_name = filePaths[0].slice(filePaths[0].lastIndexOf('/') + 1, filePaths[0].lastIndexOf('.'));
    }
    else {
        db_name = filePaths[0].slice(filePaths[0].lastIndexOf('\\') + 1, filePaths[0].lastIndexOf('.'));
    }
    // console.log('dbname', db_name);
    console.log('filePaths', filePaths);
    // command strings
    // const db_name: string = filePaths[0].slice(filePaths[0].lastIndexOf('\\') + 1, filePaths[0].lastIndexOf('.'));
    var createDB = "docker exec postgres-1 psql -h localhost -p 5432 -U postgres -c \"CREATE DATABASE " + db_name + "\"";
    var importFile = "docker cp " + filePaths + " postgres-1:/data_dump";
    var runSQL = "docker exec postgres-1 psql -U postgres -d " + db_name + " -f /data_dump";
    var runTAR = "docker exec postgres-1 pg_restore -U postgres -d " + db_name + " /data_dump";
    var extension = filePaths[0].slice(filePaths[0].lastIndexOf('.'));
    // CALLBACK FUNCTION : execute commands in the child process
    var addDB = function (str, nextStep) {
        exec(str, function (error, stdout, stderr) {
            if (error) {
                console.log("error: " + error.message);
                return;
            }
            if (stderr) {
                console.log("stderr: " + stderr);
                return;
            }
            // console.log(`stdout: ${stdout}`);
            console.log("" + stdout);
            if (nextStep)
                nextStep();
        });
    };
    // SEQUENCE OF EXECUTING COMMANDS
    // Steps are in reverse order because each step is a callback function that requires the following step to be defined.
    // Step 3 : Given the file path extension, run the appropriate command in postgres to build the db
    var step3 = function () {
        var runCmd = '';
        if (extension === '.sql')
            runCmd = runSQL;
        else if (extension === '.tar')
            runCmd = runTAR;
        addDB(runCmd, redirectModal);
    };
    // Step 2 : Import database file from file path into docker container
    var step2 = function () { return addDB(importFile, step3); };
    // Changes the pg URI to look to the newly created database and queries all the tables in that database and sends it to frontend.
    function redirectModal() {
        return __awaiter(this, void 0, void 0, function () {
            var listObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.getLists()];
                    case 1:
                        listObj = _a.sent();
                        console.log('Temp log until channel is made', listObj);
                        event.sender.send('db-lists', listObj);
                        return [2 /*return*/];
                }
            });
        });
    }
    ;
    // Step 1 : Create empty db
    if (extension === '.sql' || extension === '.tar')
        addDB(createDB, step2);
    else
        console.log('INVAILD FILE TYPE: Please use .tar or .sql extensions.');
});
/* ---END OF IMPORT DATABASE FUNCTION--- */
// Listen for user clicking skip button
electron_1.ipcMain.on('skip-file-upload', function (event) { });
//Listens for database changes sent from the renderer
electron_1.ipcMain.on('change-db', function (event, db_name) {
    db.changeDB(db_name);
    event.sender.send('return-change-db', db_name);
});
// Listen for queries being sent from renderer
electron_1.ipcMain.on('execute-query', function (event, data) {
    // ---------Refactor-------------------
    console.log('query sent from frontend', data);
    // destructure object from frontend
    var queryString = data.queryString, queryCurrentSchema = data.queryCurrentSchema, queryLabel = data.queryLabel;
    // initialize object to store all data to send to frontend
    var frontendData = {
        queryString: queryString,
        queryCurrentSchema: queryCurrentSchema,
        queryLabel: queryLabel,
        queryData: '',
        queryStatistics: '',
        lists: {},
    };
    // Run select * from actors;
    db.query(queryString)
        .then(function (queryData) {
        frontendData.queryData = queryData.rows;
        // Run EXPLAIN (FORMAT JSON, ANALYZE)
        db.query('EXPLAIN (FORMAT JSON, ANALYZE) ' + queryString).then(function (queryStats) {
            // Getting data in row format for frontend
            frontendData.queryStatistics = queryStats.rows;
            function getListAsync() {
                return __awaiter(this, void 0, void 0, function () {
                    var listObj;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, db.getLists()];
                            case 1:
                                listObj = _a.sent();
                                console.log("Should be my lists", listObj);
                                frontendData.lists = listObj;
                                event.sender.send('db-lists', listObj);
                                event.sender.send('return-execute-query', frontendData);
                                return [2 /*return*/];
                        }
                    });
                });
            }
            getListAsync();
        });
    })
        .catch(function (error) {
        console.log('THE CATCH: ', error);
    });
});
// Listen for schema edits sent from renderer
electron_1.ipcMain.on('input-schema', function (event, data) {
    console.log('schema object from frontend', data);
    var db_name;
    db_name = data.schemaName;
    var filePath = data.schemaFilePath;
    var schemaEntry = data.schemaEntry.trim();
    console.log("schema entry", schemaEntry);
    console.log('filePath', filePath);
    // command strings
    var createDB = "docker exec postgres-1 psql -h localhost -p 5432 -U postgres -c \"CREATE DATABASE " + db_name + "\"";
    var importFile = "docker cp " + filePath + " postgres-1:/data_dump";
    var runSQL = "docker exec postgres-1 psql -U postgres -d " + db_name + " -f /data_dump";
    var runScript = "docker exec postgres-1 psql -U postgres -d " + db_name + " -c \"" + schemaEntry + "\"";
    var runTAR = "docker exec postgres-1 pg_restore -U postgres -d " + db_name + " /data_dump";
    var extension = '';
    if (filePath.length > 0) {
        extension = filePath[0].slice(filePath[0].lastIndexOf('.'));
    }
    // CALLBACK FUNCTION : execute commands in the child process
    var addDB = function (str, nextStep) {
        exec(str, function (error, stdout, stderr) {
            if (error) {
                console.log("error: " + error.message);
                return;
            }
            if (stderr) {
                console.log("stderr: " + stderr);
                return;
            }
            // console.log(`stdout: ${stdout}`);
            console.log("" + stdout);
            if (nextStep)
                nextStep();
        });
    };
    // SEQUENCE OF EXECUTING COMMANDS
    // Steps are in reverse order because each step is a callback function that requires the following step to be defined.
    // Step 3 : Given the file path extension, run the appropriate command in postgres to build the db
    var step3 = function () {
        var runCmd = '';
        if (extension === '.sql')
            runCmd = runSQL;
        else if (extension === '.tar')
            runCmd = runTAR;
        else
            runCmd = runScript;
        addDB(runCmd, redirectModal);
    };
    // Step 2 : Import database file from file path into docker container
    var step2 = function () { return addDB(importFile, step3); };
    // Changes the pg URI to look to the newly created database and queries all the tables in that database and sends it to frontend.
    function redirectModal() {
        return __awaiter(this, void 0, void 0, function () {
            var listObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.getLists()];
                    case 1:
                        listObj = _a.sent();
                        event.sender.send('db-lists', listObj);
                        return [2 /*return*/];
                }
            });
        });
    }
    ;
    // const redirectModal = () => {
    //   // Redirects modal towards new imported database
    //   db.changeDB(db_name);
    //   console.log(`Connected to database ${db_name}`);
    //   // Need a setTimeout because query would run before any data gets uploaded to the database from the runTAR or runSQL commands
    //   setTimeout(async () => {
    //     let listObj;
    //     listObj = await db.getLists();
    //     console.log('Temp log until channel is made', listObj);
    //     event.sender.send('db-lists', listObj);
    //   }, 1000);
    // };
    // Step 1 : Create empty db
    if (extension === '.sql' || extension === '.tar') {
        console.log('extension is sql tar');
        console.log('file path: ', filePath);
        addDB(createDB, step2);
    }
    // if data is inputted as text
    else
        addDB(createDB, step3);
    // else console.log('INVAILD FILE TYPE: Please use .tar or .sql extensions.');
});
// Temporary Hardcode not ideal
var fromApp = {
    schema: 'public',
    table: 'table1',
    scale: 40,
    columns: [
        {
            name: '_id',
            dataCategory: 'unique',
            dataType: 'num',
            data: {
                serial: true,
            }
        },
        {
            name: 'username',
            dataCategory: 'unique',
            dataType: 'str',
            data: {
                minLen: 10,
                maxLen: 15,
                inclAlphaLow: true,
                inclAlphaUp: true,
                inclNum: true,
                inclSpaces: true,
                inclSpecChar: true,
                include: ["include", "these", "aReplace"],
            },
        },
        {
            name: 'first_name',
            dataCategory: 'random',
            dataType: 'Name - firstName',
            data: {}
        },
        {
            name: 'company_name',
            dataCategory: 'random',
            dataType: 'Company - companyName',
            data: {}
        }
    ]
};
electron_1.ipcMain.on('generate-data', function (event, paramObj) {
    // Generating Dummy Data from parameters sent from the frontend
    (function dummyFunc(paramsObj) {
        // Need addDB in this context
        var addDB = function (str, nextStep) {
            exec(str, function (error, stdout, stderr) {
                if (error) {
                    console.log("error: " + error.message);
                    return;
                }
                if (stderr) {
                    console.log("stderr: " + stderr);
                    return;
                }
                // console.log(`stdout: ${stdout}`);
                console.log("" + stdout);
                if (nextStep)
                    nextStep();
            });
        };
        var db_name = 'defaultDB';
        var schemaStr = "CREATE TABLE \"table1\"(\n                                  \"_id\" integer NOT NULL,\n                                  \"username\" VARCHAR(255) NOT NULL,\n                                  \"first_name\" VARCHAR(255) NOT NULL,\n                                  \"company_name\" VARCHAR(255) NOT NULL,\n                                  CONSTRAINT \"tabl1_pk\" PRIMARY KEY (\"_id\")\n                            ) WITH (\n                              OIDS=FALSE\n                            );";
        var insertArray = createInsertQuery(paramsObj);
        console.log(insertArray);
        db.query(schemaStr)
            .then(function (returnedData) {
            for (var i = 0; i < insertArray.length; ++i) {
                console.log(i);
                var currentInsert = insertArray[i];
                var dummyScript = "docker exec postgres-1 psql -U postgres -d " + db_name + " -c \"" + currentInsert + "\"";
                addDB(dummyScript, function () { return console.log("Dummied Database: " + db_name); });
            }
        });
    })(fromApp);
});
//# sourceMappingURL=main.js.map