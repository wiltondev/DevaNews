import { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import { NextApiResponse } from "next";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import nc from 'next-connect';
import { upload, uploadImagemCosmic } from "../../services/uploadImagemCosmic";
import { NoticiaModel } from '../../Models/NoticiaModel';
import { validarTokenJwt } from "../../middlewares/validarTokenJWT";
import { politicaCORS } from "../../middlewares/politicaCORS";

const handler = nc();

// Middleware para fazer upload de mídia vinculada a uma notícia existente (POST)
handler.use(upload.single('file'));

handler.post(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
  try {
    const { userId } = req.query;
    const noticiaId = req.query.noticiaId;
    console.log('noticiaId', noticiaId);

    // Verifique se a notícia existe no banco de dados
    const noticia = await NoticiaModel.findById(noticiaId);

    if (!noticia) {
      return res.status(404).json({ erro: 'Notícia não encontrada' });
    }

    // Verifique se o arquivo foi enviado
    if (!req.file || !req.file.originalname) {
      return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    const isImage = req.file.mimetype.startsWith('image/');

    const mediaType = isVideo ? 'video' : isImage ? 'foto' : undefined;

    if (!mediaType || mediaType === undefined) {
      return res.status(400).json({ erro: 'Tipo de arquivo inválido' });
    }

    const media = await uploadImagemCosmic(req.file); // Use req.file aqui

    const mediaNoticia = {
      tipo: mediaType,
      data: new Date(),
      URL: media.URL
    };

    // Adicione a mídia vinculada à notícia existente
    noticia.mediaNoticia = mediaNoticia;

    // Salve a notícia atualizada no banco de dados
    await noticia.save();

    return res.status(200).json({ msg: 'Mídia vinculada à notícia com sucesso' });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ erro: 'Erro ao vincular mídia à notícia' });
  }
});

export default politicaCORS(validarTokenJwt(conectarMongoDB(handler)));
