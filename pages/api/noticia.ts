// Importando as bibliotecas e módulos necessários
import type { NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import nc from 'next-connect';
import { upload, uploadImagemCosmic } from '../../services/uploadImagemCosmic';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJwt } from '../../middlewares/validarTokenJWT';
import { CategoriaModel } from '../../Models/CategoriaModel';
import { UsuarioModel } from '../../Models/UsuarioModel';
import { politicaCORS } from '../../middlewares/politicaCORS';
import getVideoDurationInSeconds from 'get-video-duration';
import { NoticiaModel } from '../../Models/NoticiaModel';
import usuario from './usuario';




const handler = nc()

  // Configurando o middleware para fazer upload de arquivos (imagem ou vídeo)
  .use(upload.single('file'))
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
      const { titulo, materia, categoriaId, nomeCategoria } = req.body;

      if (!titulo || titulo.length < 2 || titulo.length > 50) {
        return res.status(400).json({ erro: 'Título inválido' });
      }

      if (!materia || materia.length < 2 || materia.length > 5000) {
        return res.status(400).json({ erro: 'Matéria inválida' });
      }

      let categoria;
      
      if (!categoriaId) {
        return res.status(400).json({ erro: 'Categoria é obrigatória' });
      }

      categoria = await CategoriaModel.findById ( categoriaId  );

      if (!categoria && nomeCategoria) {
      categoria = await CategoriaModel.findOne({nome : nomeCategoria });
      }

      if(!categoria) {
        return res.status(400).json({ erro: 'Categoria não encontrada' });
      }
       
      // Verificando se o arquivo foi enviado


      if (!req.file) {
        return res.status(400).json({ erro: 'Imagem ou vídeo é obrigatório' });

      }

      // Verificando a rota para distinguir entre imagens e vídeos
      const isVideo = req.file.mimetype.startsWith('video/');
      const isImage = req.file.mimetype.startsWith('image/');
      
      const isVideoRoute = req.url && req.url.includes("video");

   

     
      if (isVideoRoute && isVideo) {
        const videoDuration = await getVideoDurationInSeconds(req.file.buffer);
        if (videoDuration > 120) {
          return res.status(400).json({ erro: 'Vídeo deve ter no máximo 2 minutos de duração.' });
        }

        
      }else if (isVideoRoute && isImage) {
        return res.status(400).json({ erro: 'Vídeo inválido' });
    }

       
      // Determinando o tipo de mídia (vídeo ou imagem) com base nos formatos
      const mediaType = isVideo ? 'video' : isImage ? 'foto' : undefined;

      // Verificando se o tipo de mídia é definido (nem vídeo nem imagem)
      if (mediaType === undefined) {
        return res.status(400).json({ erro: 'Tipo de arquivo não suportado.' });
      }

      // Fazendo o upload da mídia para o serviço Cosmic
      const media = await uploadImagemCosmic(req, mediaType);

      // Criando um objeto de notícia com os dados necessários
      const noticia = {
        idUsuario: usuario._id,
        titulo,
        materia,
        categoria: categoria._id,
        tipo: mediaType,   // Tipo para indicar se a mídia é um vídeo ou foto
        data: new Date(),
        arquivo: media.media.url
      };

    usuario.noticias++;
    await UsuarioModel.findByIdAndUpdate({_id : usuario._id}, usuario);
    await NoticiaModel.create(noticia);


      return res.status(200).json({ msg: 'Notícia criada com sucesso' });

    } catch (e) {
      // Lidando com erros e respondendo com uma mensagem de erro
      console.error(e);
      return res.status(400).json({ erro: 'Erro ao cadastrar notícia' });
    }
  })
  .put(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
      // Obtendo os IDs do usuário e da notícia dos parâmetros da consulta (query)
      const { postId } = req.query;
      const userId = req.user._id;
      console.log('userId:', userId);
      console.log('postId:', postId);
  
      if (!userId) {
        return res.status(401).json({ erro: 'Usuário não autenticado' });
      }
  
      // Procurando a notícia no banco de dados com base no ID
      const noticia = await NoticiaModel.findById(postId);
  
      if (!noticia) {
        return res.status(404).json({ erro: 'Notícia não encontrada' });
      }
  
      // Verificando se o usuário logado é o autor da notícia
      if (noticia.idUsuario.toString() !== userId) {
        return res.status(403).json({ erro: 'Você não tem permissão para atualizar esta notícia' });
      }
  
      // Verificando se os parâmetros de entrada estão presentes e corretos
      if (!req || !req.body) {
        return res.status(400).json({ erro: 'Parâmetros de entrada não informados' });
      }
      
      const { titulo, materia } = req.body;
      const isVideo = req.file && req.file.mimetype.startsWith('video/');
      const isImage = req.file && req.file.mimetype.startsWith('image/');
      
      // Verificando a rota para distinguir entre atualização de vídeo ou foto
      const isVideoRoute = req.url && req.url.includes("video");
  
      // Se estiver na rota de vídeo e for uma atualização de vídeo
      if (isVideoRoute && isVideo) {
        const videoDuration = await getVideoDurationInSeconds(req.file.buffer);
        if (videoDuration > 120) {
          return res.status(400).json({ erro: 'Vídeo deve ter no máximo 2 minutos de duração.' });
        }
        
        // Fazendo o upload do novo vídeo
        const media = await uploadImagemCosmic(req, 'video');
        noticia.arquivo = media.media.url;
        noticia.tipo = 'video';
      }
      
      // Se estiver na rota de imagem e for uma atualização de imagem
      if (!isVideoRoute && isImage) {
        // Fazendo o upload da nova imagem
        const media = await uploadImagemCosmic(req, 'foto');
        noticia.arquivo = media.media.url;
        noticia.tipo = 'foto';
      }
  
      // Atualizando os campos título e matéria se estiverem presentes no corpo da requisição
      if (titulo) {
        noticia.titulo = titulo;
      }
  
      if (materia) {
        noticia.materia = materia;
      }
  
      // Salvando a notícia atualizada
      await noticia.save();
  
      return res.status(200).json({ msg: 'Notícia atualizada com sucesso' });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ erro: 'Erro ao atualizar notícia' });
    }
  })
  
 .delete(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
      // Obtendo os IDs do usuário e da publicação dos parâmetros da consulta (query)
      const { postId} = req.query;
      const userId = req.user._id;
      console.log('userId:', userId);
      console.log('postId:', postId);

    
      if (!usuario) {
        return res.status(400).json({ erro: 'Usuário não encontrado' });
      }
      
      const noticia = await NoticiaModel.findById(postId);

      if (!noticia) {
        return res.status(400).json({ erro: 'Publicação não encontrada' });
      }

      if(noticia.idUsuario.toString() !== userId){
        return res.status(400).json({ erro: 'Usuário não autorizado' });
      }

      await NoticiaModel.deleteOne({ _id: postId });

         return res.status(200).json({ msg: 'Publicação deletada com sucesso' });
    } catch (e) {
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
