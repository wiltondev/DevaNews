import sharp from "sharp";
import type { NextApiResponse } from "next";
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import nc from "next-connect";
import { upload, uploadImagemCosmic } from "../../services/uploadImagemCosmic";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { validarTokenJwt } from "../../middlewares/validarTokenJWT";
import { CategoriaModel } from "../../Models/CategoriaModel";
import { UsuarioModel } from "../../Models/UsuarioModel";
import { politicaCORS } from "../../middlewares/politicaCORS";
import { NoticiaModel } from "../../Models/NoticiaModel";
import { Readable } from "stream";
import { getVideoDurationInSeconds } from "get-video-duration"; // Importar get-video-duration

const handler = nc()
  .use(upload.single("file"))

  .post(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
      const { userId } = req.query;
      console.log("userId:", userId);

      // Encontre o usuário pelo ID
      const usuario = await UsuarioModel.findById(userId);
      if (!usuario) {
        return res.status(400).json({ erro: "Usuário não encontrado" });
      }

      // Verifique se os parâmetros de entrada estão presentes e corretos
      if (!req || !req.body) {
        return res
          .status(400)
          .json({ erro: "Parâmetros de entrada não informados" });
      }
      const { titulo, materia, categoriaId } = req?.body;

      // Valide os campos do formulário
      if (!titulo || titulo.length < 2 || titulo.length > 50) {
        return res.status(400).json({ erro: "Título inválido" });
      }

      if (!materia || materia.length < 2 || materia.length > 5000) {
        return res.status(400).json({ erro: "Matéria inválida" });
      }

      if (!categoriaId) {
        return res.status(400).json({ erro: "Categoria é obrigatória" });
      }

      // Verifique se a categoria existe no banco de dados
      const categoriaExistente = await CategoriaModel.findById(categoriaId);
      console.log("categoriaExistente:", categoriaExistente);

      if (!categoriaExistente) {
        return res.status(400).json({ erro: "Categoria inválida" });
      }

      // Verifique se um arquivo foi enviado e obtenha a extensão do arquivo
      if (!req.file || !req.file.originalname) {
        return res.status(400).json({ erro: "Arquivo é obrigatório" });
      }
      const fileExtension = req.file.originalname.toLowerCase().slice(-4);
      const allowedImageExtensions = [".jpeg", ".png", ".jpg", ".bmp"];
      const allowedVideoExtensions = [".mp4", ".webm", ".mov", ".avi"];

      // Verifique se o formato do arquivo é suportado (imagem ou vídeo)
      if (
        !allowedImageExtensions.includes(fileExtension) &&
        !allowedVideoExtensions.includes(fileExtension)
      ) {
        return res.status(400).json({
          erro: "Formato de arquivo não suportado. Apenas imagens ou vídeos são permitidos.",
        });
      }

      if (allowedVideoExtensions.includes(fileExtension)) {
        // Crie um fluxo legível (Readable Stream) a partir do buffer do arquivo
        const videoStream = Readable.from(req.file.buffer);

        // Use a biblioteca get-video-duration para obter a duração do vídeo
        const durationInSeconds = await getVideoDurationInSeconds(videoStream);

        if (durationInSeconds > 120) {
          return res
            .status(400)
            .json({ erro: "Vídeo deve ter no máximo 2 minutos de duração." });
        }
      } else if (allowedImageExtensions.includes(fileExtension)) {
        const imageBuffer = req.file.buffer;

        // Use a biblioteca sharp para obter informações sobre a imagem
        const imageInfo = await sharp(imageBuffer).metadata();

        if (!imageInfo) {
          return res.status(400).json({
            erro: "Não foi possível obter informações sobre a imagem.",
          });
        }

        // Aqui você pode usar as informações da imagem, como imageInfo.width e imageInfo.height
      }

      // Faça upload da imagem ou vídeo para o serviço (uploadImagemCosmic)
      const media = await uploadImagemCosmic(req);

      // Crie um objeto de notícia com os dados
      const noticia = new NoticiaModel({
        idUsuario: usuario._id,
        titulo,
        materia,
        categoria: categoriaExistente._id,
        url: media?.media?.url, // Use a URL do arquivo enviado
        data: new Date(),
      });

      // Atualize o contador de notícias do usuário
      usuario.noticias++;
      await UsuarioModel.findByIdAndUpdate({ _id: usuario._id }, usuario);

      // Crie a notícia no banco de dados
      await NoticiaModel.create(noticia);

      return res.status(200).json({ msg: "Notícia criada com sucesso" });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ erro: "Erro ao criar notícia" });
    }
  });
handler
  .put(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
      const { noticiaId } = req.query;
      const { userId } = req.query;
      console.log("userId:", userId);
      console.log("noticiaId:", noticiaId);

      // Encontre o usuário pelo ID
      const usuario = await UsuarioModel.findById(userId);
      if (!usuario) {
        return res.status(400).json({ erro: "Usuário não encontrado" });
      }

      // Encontre a notícia pelo ID
      const noticia = await NoticiaModel.findById(noticiaId);
      if (!noticia) {
        return res.status(400).json({ erro: "Notícia não encontrada" });
      }

      // Verifique se os parâmetros de entrada estão presentes e corretos
      if (!req || !req.body) {
        return res
          .status(400)
          .json({ erro: "Parâmetros de entrada não informados" });
      }
      const { titulo, materia, categoria } = req?.body;

      // Valide os campos do formulário
      if (!titulo || titulo.length < 2 || titulo.length > 50) {
        return res.status(400).json({ erro: "Título inválido" });
      }

      if (!materia || materia.length < 2 || materia.length > 5000) {
        return res.status(400).json({ erro: "Matéria inválida" });
      }

      if (!categoria) {
        return res.status(400).json({ erro: "Categoria é obrigatória" });
      }

      // Verifique se a categoria existe no banco de dados
      const categoriaExistente = await CategoriaModel.findById(categoria);
      console.log("categoriaExistente:", categoriaExistente);

      if (!categoriaExistente) {
        return res.status(400).json({ erro: "Categoria inválida" });
      }

      if (req.file && req.file.originalname) {
        const fileExtension = req.file.originalname.toLowerCase().slice(-4);
        const allowedImageExtensions = [".jpeg", ".png", ".jpg", ".bmp"];
        const allowedVideoExtensions = [".mp4", ".webm", ".mov", ".avi"];

        if (
          !allowedImageExtensions.includes(fileExtension) &&
          !allowedVideoExtensions.includes(fileExtension)
        ) {
          return res.status(400).json({
            erro: "Formato de arquivo não suportado. Apenas imagens ou vídeos são permitidos.",
          });
        }

        if (allowedVideoExtensions.includes(fileExtension)) {
          // Crie um fluxo legível (Readable Stream) a partir do buffer do arquivo
          const videoStream = Readable.from(req.file.buffer);

          // Use a biblioteca get-video-duration para obter a duração do vídeo
          const durationInSeconds = await getVideoDurationInSeconds(
            videoStream
          );

          if (durationInSeconds > 120) {
            return res
              .status(400)
              .json({ erro: "Vídeo deve ter no máximo 2 minutos de duração." });
          }
        }
      }

      // Atualize a notícia com os novos dados
      noticia.titulo = titulo;
      noticia.materia = materia;
      noticia.categoria = categoriaExistente._id;

      await NoticiaModel.findByIdAndUpdate(noticiaId, noticia);

      return res.status(200).json({ msg: "Notícia atualizada com sucesso" });
    } catch (e) {
      console.error(e);

      return res.status(400).json({ erro: "Erro ao atualizar notícia" });
    }
  })

  .delete(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
      const { userId } = req;
      const { noticiaId } = req.query;

      const noticia = await NoticiaModel.findById(noticiaId);
      if (!noticia) {
        return res.status(400).json({ erro: "Notícia não encontrada" });
      }

      // Exclua a notícia do banco de dados
      await NoticiaModel.findByIdAndDelete(noticiaId);

      return res.status(200).json({ msg: "Notícia excluída com sucesso" });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ erro: "Erro ao excluir notícia" });
    }
  });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default politicaCORS(validarTokenJwt(conectarMongoDB(handler)));
