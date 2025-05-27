import fs from "fs";
import path from "path";
import {fileURLToPath} from "url"; // importa o caminho do arquivo

const __filename = fileURLToPath(import.meta.url); // pega o caminho do arquivo
const __dirname = path.dirname(__filename); // pega o caminho da pasta

const logsDir = path.join(__dirname, "../logs"); 
const logFile = path.join(logsDir, "requests.json");

// Garante que a pasta e o arquivo exista
function ensureLogFile() {
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }

    if (!fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, "[]");
    }
}


// Isso é uma Middleware, geralmente com um next, verifica o arquivo no meio do caminho.
function logger (request, response, next) {
    ensureLogFile();

    const logData = {
        date: new Date().toLocaleDateString(),
        method: request.method,
        url: request.url,
        body: request.body
    }; 


    console.log("$[{logData.date}] - ${logData.method} - ${logData.url} - ${logData.body}");
    

    fs.readFile(logFile, "utf-8", (erro, data) => {
        let logs = [];

        try {
            logs = JSON.parse(data || "[]");
            
        } catch {
            logs = [];
        }

        logs.push (logData);

        fs.writeFile(logFile, JSON.stringify(logs, null, 2), (erro) => {
            if (erro){
                console.error("Erro ao salvar o log:", erro);
            }
        });
    });

    next();

}

export default logger;