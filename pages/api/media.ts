// Importações de módulos e middlewares necessários
import type { NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import nc from 'next-connect';
import { upload, uploadImagemCosmic } from '../../services/uploadImagemCosmic';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJwt } from '../../middlewares/validarTokenJWT';
import  {NoticiaModel}  from '../../Models/NoticiaModel';
import { UsuarioModel } from '../../Models/UsuarioModel';
import { MediaModel }from "../../Models/MediaModel";
import { politicaCORS } from '../../middlewares/politicaCORS';
import getVideoDurationInSeconds from 'get-video-duration';


// Configurando o manipulador de rotas Next.js
const handler = nc();

handler
  .use(upload.single('file')) // Middleware para upload de arquivos

  // Rota para criar uma mídia vinculada a uma notícia (POST)
  .post(
    validarTokenJwt, // Middleware para validar o token JWT (usuário autenticado)
    async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
      try {
        // Obtendo o ID do usuário autenticado
        const userId = req.user;

        // Obtendo o ID da notícia vinculada à mídia a partir do corpo da solicitação
        const { noticiaId } = req.body;

        // Verificando se o usuário existe no banco de dados
        const usuario = await UsuarioModel.findById(userId);
        if (!usuario) {
          return res.status(400).json({ erro: 'Usuário não encontrado' });
        }

        // Verificando se a notícia vinculada à mídia existe
        const noticia = await NoticiaModel.findById(noticiaId);
        if (!noticia) {
          return res.status(400).json({ erro: 'Notícia não encontrada' });
        }

        // Verificando se os parâmetros de entrada estão presentes e corretos
        if (!req.file || !req.file.originalname) {
          return res.status(400).json({ erro: 'Imagem ou vídeo é obrigatório' });
        }

        // Verificando a rota para distinguir entre imagens e vídeos
        const isVideo = req.file.mimetype.startsWith('video/');
        const isImage = req.file.mimetype.startsWith('image/');

        // Se for um vídeo, verificar a duração
        if (isVideo) {
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

        // Criando um objeto de mídia com os dados necessários
        const novaMedia = {
          noticiaId,
          nomeArquivo: media.nomeArquivo, // Substitua pelo nome do arquivo real
        };

        // Criando a mídia no banco de dados
        const mediaCriada = await MediaModel.create(novaMedia);

        // Retornando a resposta com sucesso
        return res.status(200).json({ msg: 'Mídia criada com sucesso', mediaId: mediaCriada._id });
      } catch (e) {
        // Lidando com erros e respondendo com uma mensagem de erro
        console.error(e);
        return res.status(400).json({ erro: 'Erro ao cadastrar mídia' });
      }
    }
  );

export default politicaCORS(conectarMongoDB(handler));
