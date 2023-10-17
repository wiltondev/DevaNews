// routes/noticias.js
import { NextApiResponse } from "next";
import { NoticiaModel } from "../../Models/NoticiaModel";
import { CategoriaModel } from "../../Models/CategoriaModel";
import nc from "next-connect";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { politicaCORS } from "../../middlewares/politicaCORS";
import { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";

const handler = nc().get(
  async (req: any, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
      if (req?.query?.id) {
        // Recupere todas as notícias dessa categoria
        const noticias = await NoticiaModel.find({ _id: req?.query?.id });

        // Formate as notícias para a resposta
        const noticiasFormatadas = await Promise.all(
          noticias.map(async (noticia) => {
            // Encontre a categoria pelo _id da notícia
            const categoria = await CategoriaModel.findById(noticia.categoria);
            // Adicione o nome da categoria à notícia
            const noticiaFormatada = {
              titulo: noticia.titulo,
              materia: noticia.materia,
              url: noticia.url,
              video: noticia.video,
              data: noticia.data,
              categoria: categoria ? categoria.nomeCategoria : null,
              categoriaId: noticia.categoria,
              _id: noticia._id.toString(),
            };
            return noticiaFormatada;
          })
        );

        return res.status(200).json(noticiasFormatadas);
      } else {
        // Recupere todas as notícias dessa categoria
        const noticias = await NoticiaModel.find();

        // Formate as notícias para a resposta
        const noticiasFormatadas = await Promise.all(
          noticias.map(async (noticia) => {
            // Encontre a categoria pelo _id da notícia
            const categoria = await CategoriaModel.findById(noticia.categoria);
            // Adicione o nome da categoria à notícia
            const noticiaFormatada = {
              titulo: noticia.titulo,
              materia: noticia.materia,
              url: noticia.url,
              video: noticia.video,
              data: noticia.data,
              categoria: categoria ? categoria.nomeCategoria : null,
              categoriaId: noticia.categoria,
              _id: noticia._id.toString(),
            };
            return noticiaFormatada;
          })
        );

        return res.status(200).json(noticiasFormatadas);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro ao listar notícias" });
    }
  }
);

export default politicaCORS(conectarMongoDB(handler));
