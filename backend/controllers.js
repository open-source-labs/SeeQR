const database = {};
const { exec } = require("child_process");

database.testing = () => {
    exec('docker exec postgres-1 psql -h localhost -p 5432 -U postgres -c "\\c hello_there;"', (error, stdout, stderr) => {
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

