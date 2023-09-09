// Importando as bibliotecas e módulos necessários
import type { NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import nc from 'next-connect';
import { upload, uploadImagemCosmic } from '../../services/uploadImagemCosmic';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJwt } from '../../middlewares/validarTokenJWT';
import { NoticiaModel } from '../../Models/NoticiasModel';
import { UsuarioModel } from '../../Models/UsuarioModel';
import { politicaCORS } from '../../middlewares/politicaCORS';

// Importando as bibliotecas e módulos necessários
import type { NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import nc from 'next-connect';
import { upload, uploadImagemCosmic } from '../../services/uploadImagemCosmic';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJwt } from '../../middlewares/validarTokenJwt';
import { NoticiaModel } from '../../models/NoticiaModel';
import { UsuarioModel } from '../../models/UsuarioModel';
import { politicaCORS } from '../../middlewares/politicaCORS';

// Configurando o manipulador de rotas Next.js usando next-connect
const handler = nc()

  // Configurando o middleware para fazer upload de imagens
  .use(upload.single('file'))

  // Lidando com uma solicitação POST para criar uma notícia
  .post(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
      // Obtendo o ID do autor a partir dos parâmetros da consulta (query)
      const { autorId } = req.query;
      console.log('autorId:', autorId);

      // Procurando o autor no banco de dados com base no ID
      const autor = await UsuarioModel.findById(autorId);
      if (!autor) {
        return res.status(400).json({ erro: 'Autor não encontrado' });
      }

      // Verificando se os parâmetros de entrada estão presentes e corretos
      if (!req || !req.body) {
        return res.status(400).json({ erro: 'Parâmetros de entrada não informados' });
      }
      const { titulo, conteudo, categoria } = req.body;
      console.log('titulo:', titulo);
      console.log('conteudo:', conteudo);
      console.log('categoria:', categoria);

      if (!titulo || titulo.length < 2) {
        return res.status(400).json({ erro: 'Título inválido' });
      }

      if (!conteudo || conteudo.length < 10 || conteudo.length > 5000) {
        return res.status(400).json({ erro: 'Conteúdo inválido' });
      }

      if (!categoria || !['Política', 'Esporte', 'Cultura', 'Economia', 'Saúde', 'Tecnologia'].includes(categoria)) {
        return res.status(400).json({ erro: 'Categoria inválida' });
      }

      if (!req.file || !req.file.originalname) {
        return res.status(400).json({ erro: 'Imagem é obrigatória' });
      }

      // Verificando se a imagem é do tipo correto
      const isImage = req.file.mimetype.startsWith('image/');

      if (!isImage) {
        return res.status(400).json({ erro: 'Tipo de arquivo não suportado.' });
      }

      // Fazendo o upload da imagem para o serviço Cosmic
      const imagem = await uploadImagemCosmic(req, 'foto');

      // Criando um objeto de notícia com os dados necessários
      const noticia = {
        titulo,
        conteudo,
        autor: autor._id,
        categoria,
        data: new Date(),
        imagem,
        comentarios: [],
        curtidas: 0,
      };

      // Criando a notícia no banco de dados
      await NoticiaModel.create(noticia);

      // Respondendo com uma mensagem de sucesso
      return res.status(200).json({ msg: 'Notícia criada com sucesso' });
    } catch (e) {
      // Lidando com erros e respondendo com uma mensagem de erro
      console.error(e);
      return res.status(400).json({ erro: 'Erro ao cadastrar notícia' });
    }
  })

  // ... (rotas GET, PUT e DELETE para obter, atualizar e excluir notícias)

export default handler;
