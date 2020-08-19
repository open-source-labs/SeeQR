const database = {};
const { exec } = require("child_process");

database.testing = () => {
    exec("docker container attach postgres-1", (error, stdout, stderr) => {
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
}

database.testing();

