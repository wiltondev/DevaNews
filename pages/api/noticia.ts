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
import { NoticiaModel } from '../../Models/NoticiaModel';
import categoria from './categoria';
import imageType from 'image-type';

const handler = nc()

  // Configurando o middleware para fazer upload de arquivos (imagem ou vídeo)
  .use(upload.single('file'))

  // Lidando com uma solicitação POST para criar uma notícia
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
      const { titulo, materia, categoriaId } = req?.body;

      if (!titulo || titulo.length < 2 || titulo.length > 50) {
        return res.status(400).json({ erro: 'Título inválido' });
      }

      if (!materia || materia.length < 2 || materia.length > 5000) {
        return res.status(400).json({ erro: 'Matéria inválida' });
      }

      if (!categoria) {
        return res.status(400).json({ erro: 'Categoria é obrigatória' });
      }
  
      // Verifique se a categoria existe no banco de dados
      const categoriaExistente = await CategoriaModel.findById ( categoriaId )
      console.log("categoriaExistente:", categoriaExistente);
  
      if (!categoriaExistente) {
        // Se a categoria não existir, você pode optar por criar automaticamente ou retornar um erro
        return res.status(400).json({ erro: 'Categoria inválida' });
      }
       
         
      if (!req.file || !req.file.originalname) {
        return res.status(400).json({ erro: 'file é obrigatório' });

      }
      const buffer = req.file.buffer;
      const type = await imageType(buffer);

      if (!type || !['image/jpeg', 'image/png', 'image/jpg', 'image/bmp'].includes(type.mime)) {
  return res.status(400).json({ erro: 'Tipo de arquivo não suportado. Apenas imagens são permitidas.' });
      }


      const image = await uploadImagemCosmic(req);
      const noticia = {
        idUsuario: usuario._id,
        titulo,
        materia,
        categoria: categoriaExistente._id,
        foto : image.media.url,
        data: new Date()
      }


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
 
export const config = {
  api: {
    bodyParser: false,
  },
};

export default politicaCORS(validarTokenJwt(conectarMongoDB(handler)));
