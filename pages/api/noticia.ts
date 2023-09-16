import type { NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import nc from 'next-connect';
import { upload, uploadImagemCosmic } from '../../services/uploadImagemCosmic';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJwt } from '../../middlewares/validarTokenJWT';
import { NoticiaModel } from '../../Models/NoticiaModel'; 
import { UsuarioModel } from '../../Models/UsuarioModel';
import { politicaCORS } from '../../middlewares/politicaCORS';


const handler = nc()
  .use(upload.single('file'))
  .post(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
      const { userId } = req.query;
      console.log('userId:', userId);

      const usuario = await UsuarioModel.findById(userId);
      if (!usuario) {
        return res.status(400).json({ erro: 'Usuário não encontrado' });
      }

      if (!req || !req.body) {
        return res.status(400).json({ erro: 'Parâmetros de entrada não informados' });
      }

      const { titulo, materia, categoria } = req.body;
      console.log('titulo:', titulo);
      console.log('materia:', materia);
      console.log('categoria:', categoria);

      if (!titulo || titulo.length > 200) {
        return res.status(400).json({ erro: 'Título inválido' });
      }

      if (!materia || materia.length < 2 || materia.length > 3000) {
        return res.status(400).json({ erro: 'Matéria inválida' });
      }

      if (!categoria || categoria.length > 30) {
        return res.status(400).json({ erro: 'Categoria inválida' });
      }

      let mediaType;

      if (req.file && req.file.buffer) {
        const isVideo = req.file.mimetype.startsWith('video/');
        const isImage = req.file.mimetype.startsWith('image/');
        mediaType = isVideo ? 'video' : isImage ? 'image' : undefined;
      } else {
        // Se não houver arquivo, você pode definir o mediaType como "sem media"
        mediaType = "sem media";
      }

      
      if (mediaType === undefined) {
        return res.status(400).json({ erro: 'Tipo de arquivo não suportado.' });
      }
     

      const media = await uploadImagemCosmic(req, mediaType);

      const noticia = {
        idUsuario: usuario._id,
        titulo,
        materia,
        categoria,
        tipo: mediaType,
        data: new Date(),
      };

      await NoticiaModel.create(noticia);

      return res.status(200).json({ msg: 'Materia criada com sucesso' });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ erro: 'Erro ao cadastrar notícia' });
    }
  })
  .delete(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
      const{noticiaId } = req.query;
     


      const userId= req.user

      const usuario = await UsuarioModel.findById(userId);
      console.log("usuario:",usuario.nome);
      if (!usuario) {
        return res.status(400).json({ erro: 'Usuário não encontrado' });  

      };
      const noticiasMinhas = await NoticiaModel.find({_id: noticiaId, idUsuario: usuario._id });
      console.log("noticiasMinhas:",noticiasMinhas);
      if (noticiasMinhas && noticiasMinhas.length> 0) {
        await NoticiaModel.deleteOne({ _id: noticiaId, idUsuario: usuario._id });
        return res.status(200).json({ msg: 'Notícia deletada com sucesso' });
      
              
      }

      return res.status(400).json({ erro: 'Notícia não encontrada' });
    
    } catch (e) {
      console.error(e);
      return res.status(400).json({ erro: 'Erro ao deletar notícia' });
    }
  });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default politicaCORS(validarTokenJwt(conectarMongoDB(handler)));
