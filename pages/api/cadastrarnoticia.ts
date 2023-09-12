// Importações necessárias para o funcionamento do código
import { NextApiRequest, NextApiResponse } from "next";
import { validarTokenJwt } from "../../middlewares/validarTokenJWT";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import {NoticiaModel} from "../../Models/NoticiaModel";
import {UsuarioModel } from "../../Models/UsuarioModel"; // Importe o modelo de usuário
import nc from 'next-connect';
import { upload, uploadImagemCosmic } from "../../services/uploadImagemCosmic";
import { politicaCORS } from "../../middlewares/politicaCORS";
import { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";

// Configurando um manipulador (handler) para a API usando next-connect
const handler = nc ()
  .use(upload.single('file')) // Configuração para fazer upload de uma imagem
  .post(async (req:any, res:NextApiResponse<RespostaPadraoMsg>) => {
    try {
      // Obtém o ID do usuário a partir do cabeçalho da solicitação
    
      const {userId} = req.query; 
      console.log('userId:', userId);

      // Procura pelo usuário no banco de dados com base no ID fornecido
      const usuario = await UsuarioModel.findById(userId);
      if (!usuario) {
          return res.status(400).json({ erro: 'Usuário não encontrado' });
        }
        
        // Verifica se a solicitação possui um corpo válido
      if (!req || !req.body ) {
          return res.status(400).json({ erro: 'Garanta que a solicitação tenha um corpo válido' });
      }
      
      const {titulo, conteudo, categoria} = req.body;
      
      
      if (!titulo || titulo.length < 2 || titulo.length > 200) {

          return res.status(400).json({ erro: 'O título deve ter entre 2 e 200 caracteres' });
      }
  
      if (conteudo.length > 3000) {
          return res.status(400).json({ erro: "O conteúdo da matéria deve conter no máximo 3000 caracteres" });
        }
        
        const imagem = await uploadImagemCosmic(req, "materia");
        
      const noticia = new NoticiaModel({
          titulo,
          conteudo,
          autor: userId,
          categoria,
          imagem: imagem?.media?.url,
      });
  
      await noticia.save();
  
      return res.status(201).json({ msg: "Matéria cadastrada com sucesso" });
  }
     catch (error) {
      // Em caso de erro, retorna uma resposta de erro
      console.error(error);
      return res.status(500).json({ erro: "Erro ao cadastrar a matéria" });
    }
});

// Configuração da API
export const config = {
  api: {
    bodyParser: true, // Desativa o parser automático do corpo da solicitação
  },
};

// Aplica as middlewares (middlewares são funções intermediárias) à rota da API
export default politicaCORS(validarTokenJwt(conectarMongoDB(handler)));
