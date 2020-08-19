const database = {};
const { exec } = require("child_process");

database.testing = () => {
    exec("docker exec -it postgres-1 bash", (error, stdout, stderr) => {
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

