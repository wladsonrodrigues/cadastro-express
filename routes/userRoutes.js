import express from "express";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import {v4 as uuidv4} from "uuid"; // import {v4 as uu id} from "uuid";
import {fileURLToPath} from "url"; // importa o caminho do arquivo

const router = express.Router(); // cria uma rota
const __filename = fileURLToPath(import.meta.url); // pega o caminho do arquivo
const __dirname = path.dirname(__filename); // pega o caminho da pasta

const usersFiles = path.join(__dirname, "../data/users.json"); // pega o caminho do arquivo

// Garante que o arquivo exista, se o arquivo não existir cria o arquivo users.json se necessario
if (!fs.existsSync(usersFiles)){
    fs.writeFileSync(usersFiles, "[]");
}

router.post("/", async (request, response) => {
    // Desestruturação dos dados enviado por post/ na requisição(Pegar os dados de um json e passar para uma variavel)
    const {nome, email, senha} = request.body;

    //Verifica os campos em brancos
    if (!nome || !email || !senha){
        return response.status(400).json({erro: "Nome, E-email e Senha sao obrigatorios"});
    }

    try {
        //Busca os usuários existentes
        const data = fs.readFileSync(usersFiles, "utf-8");
        const users = JSON.parse(data);

        //Verifica se o email ja existe
        const EmailExists = users.find(user => user.email === email);
        if (EmailExists){
             return response.status(409).json({
                error: "Email ja cadastrado"
            });
        }

        // Gera o hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Cria um novo usuário
        const newUser = {
            // id: uid(),
            id: uuidv4,
            nome: nome,
            email: email,
            senha: hashedPassword,
            createdAt: new Date().toLocaleDateString("pt-BR"),
            updateAt: new Date().toLocaleDateString("pt-BR")
        };

        // Adiciona o novo usuário ao array de usuários
        users.push(newUser);

        //Salva no arquivo
        fs.writeFileSync(usersFiles, JSON.stringify(users, null, 2));

        //Remove a senha do retorno (não mostra a senha na tela)
        const {senha: _, ...userWithoutPassword} = newUser;

        response.status(201).json({
            mensagem: "Usuario cadastrado com sucesso!",
            usuario: userWithoutPassword
        });


    } catch (erro) {
        console.error("Erro ao cadastrar o usuario:", erro);
        response.status(500).json({
            error: "Erro ao cadastrar o usuario"
        });
        
    }
});

export default router;