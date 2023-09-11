import { NextApiRequest, NextApiResponse } from "next";
import { validarTokenJwt } from "../../middlewares/validarTokenJWT";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import NoticiaModel from "../../Models/NoticiaModel"
import nc from 'next-connect';
import { uploadImagemCosmic } from "../../services/uploadImagemCosmic";
import { politicaCORS } from "../../middlewares/politicaCORS";

const handler = nc()
    .use(validarTokenJwt) // Middleware para validar o token JWT
    .post(async (req: NextApiRequest, res: NextApiResponse) => {
        if (req.method !== 'POST') {
            return res.status(405).json({ erro: 'Método informado não é válido' }); // Corrigi a mensagem de erro
        }
        try {
            const { titulo, conteudo, categoria } = req.body;
            const autor = req.query.userId; // Obtém o ID do usuário autenticado

            // Valida se o conteúdo da matéria não excede 3000 caracteres
            if (conteudo.length > 3000) {
                return res.status(400).json({ erro: "O conteúdo da matéria deve conter no máximo 3000 caracteres" });
            }

            // Fazer upload da imagem para o Cosmic
            const imagem = await uploadImagemCosmic(req, "materia");

            // Criar a matéria no MongoDB
            const noticia = new NoticiaModel({
                titulo,
                conteudo,
                autor,
                categoria,
                imagem: imagem?.media?.url,
            });

            await noticia.save();

            return res.status(201).json({ mensagem: "Matéria cadastrada com sucesso" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao cadastrar a matéria" });
        }
    });

export const config = {
    api: {
        bodyParser: false
    }
};

export default politicaCORS(validarTokenJwt(conectarMongoDB(handler)));
