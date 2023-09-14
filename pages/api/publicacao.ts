// Importando as bibliotecas e módulos necessários
import type { NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import nc from 'next-connect';
import { upload, uploadImagemCosmic } from '../../services/uploadImagemCosmic';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJwt } from '../../middlewares/validarTokenJWT';
import { PublicacaoModel } from '../../Models/PublicacaoModel';
import { UsuarioModel } from '../../Models/UsuarioModel';
import { politicaCORS } from '../../middlewares/politicaCORS';
import getVideoDurationInSeconds from 'get-video-duration';

// Configurando o manipulador de rotas Next.js
const handler = nc()

  // Configurando o middleware para fazer upload de arquivos (imagem ou vídeo)
  .use(upload.single('file'))

  // Lidando com uma solicitação POST para criar uma publicação
  .post(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
      // Obtendo o ID do usuário a partir dos parâmetros da consulta (query)
      const { userId } = req.query;
      console.log('userId:', userId);

      // Procurando o usuário no banco de dados com base no ID
      const usuario = await UsuarioModel.findById(userId);
      if (!usuario) {
        return res.status(400).json({ erro: 'Usuário não encontrado' });
      }

      // Verificando se os parâmetros de entrada estão presentes e corretos
      if (!req || !req.body) {
        return res.status(400).json({ erro: 'Parâmetros de entrada não informados' });
      }
      const { descricao } = req.body;
      console.log('descricao:', descricao);

      if (!descricao || descricao.length < 2) {
        return res.status(400).json({ erro: 'Descrição inválida' });
      }

      if (!req.file || !req.file.originalname) {
        return res.status(400).json({ erro: 'Imagem ou vídeo é obrigatório' });
      }

      // Verificando a rota para distinguir entre imagens e vídeos
      const isReelsRoute = req.url && req.url.includes("reels");
      const isVideo = req.file.mimetype.startsWith('video/');
      const isImage = req.file.mimetype.startsWith('image/');

      // Se estiver na rota "reels" e for um vídeo, verificar a duração
      if (isReelsRoute && isVideo) {
        const videoDuration = await getVideoDurationInSeconds(req.file.buffer);
        if (videoDuration > 120) {
          return res.status(400).json({ erro: 'Vídeo deve ter no máximo 2 minutos de duração.' });
        }
      }

      // Determinando o tipo de mídia (vídeo ou imagem) com base nos formatos
      const mediaType = isVideo ? 'video' : isImage ? 'foto' : undefined;

      // Verificando se o tipo de mídia é definido (nem vídeo nem imagem)
      if (mediaType === undefined) {
        return res.status(400).json({ erro: 'Tipo de arquivo não suportado.' });
      }

      // Fazendo o upload da mídia para o serviço Cosmic
      const media = await uploadImagemCosmic(req, mediaType);

      // Criando um objeto de publicação com os dados necessários
      const publicacao = {
        idUsuario: usuario._id,
        descricao,
        tipo: mediaType,   // Tipo para indicar se a mídia é um vídeo ou foto
        data: new Date(),
      };

      // Atualizando o número de publicações do usuário no banco de dados
      usuario.publicacoes++;
      await UsuarioModel.findByIdAndUpdate({ _id: usuario._id }, usuario);

      // Criando a publicação no banco de dados
      await PublicacaoModel.create(publicacao);

      // Respondendo com uma mensagem de sucesso
      return res.status(200).json({ msg: 'Publicação criada com sucesso' });
    } catch (e) {
      // Lidando com erros e respondendo com uma mensagem de erro
      console.error(e);
      return res.status(400).json({ erro: 'Erro ao cadastrar publicação' });
    }
  })

  // Configurando o middleware para lidar com solicitações DELETE
  .delete(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
      // Obtendo os IDs do usuário e da publicação dos parâmetros da consulta (query)
      const { postId, userId } = req.query;
      console.log('userId:', userId);
      console.log('postId:', postId);

      // Procurando o usuário no banco de dados com base no ID
      const usuario = await UsuarioModel.findById(userId);
      console.log('usuario:', usuario.nome);
      if (!usuario) {
        return res.status(400).json({ erro: 'Usuário não encontrado' });
      }

      // Verificando se existe pelo menos uma publicação com o ID especificado pelo usuário
      const publicacoesMinhas = await PublicacaoModel.find({ _id: postId, idUsuario: userId });
      if (publicacoesMinhas && publicacoesMinhas.length > 0) {
        // Deletando a publicação
        await PublicacaoModel.deleteOne({ _id: postId });
        // Respondendo com uma mensagem de sucesso
        return res.status(200).json({ msg: 'Publicação deletada com sucesso' });
      }

      // Respondendo com uma mensagem de erro se a publicação não for encontrada
      return res.status(400).json({ erro: 'Publicação não encontrada' });
    } catch (e) {
      // Lidando com erros e respondendo com uma mensagem de erro
      console.error(e);
      return res.status(400).json({ erro: 'Erro ao deletar publicação' });
    }
  });

// Configuração para desabilitar o parsing automático do corpo da requisição
export const config = {
  api: {
    bodyParser: false,
  },
};

// Aplicando middlewares à rota principal
export default politicaCORS(validarTokenJwt(conectarMongoDB(handler)));
