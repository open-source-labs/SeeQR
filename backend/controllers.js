const database = {};
const { exec } = require("child_process");

database.testing = () => {
    exec("", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });

// exec("psql -h localhost -p 5432 -U postgres", (error, stdout, stderr) => {
//     if (error) {
//         console.log(`error: ${error.message}`);
//         return;
//     }
//     if (stderr) {
//         console.log(`stderr: ${stderr}`);
//         return;
//     }
//     console.log(`stdout: ${stdout}`);
// });
}


// database.uploadFile = () => {
// }

// database.executeQuery = () => {
// }

// database.editSchema = () => {
// }

// export default database;

database.testing();