import type { NextApiRequest, NextApiResponse } from "next";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { politicaCORS } from "../../middlewares/politicaCORS";
import { NoticiaModel } from "../../Models/NoticiaModel";
import { CategoriaModel } from "../../Models/CategoriaModel";
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";

const listarNoticiasPorCategoriaEndpoint = async (
  req: NextApiRequest,
  res: NextApiResponse<RespostaPadraoMsg | any[]>
) => {
  try {
    if (req.method === "GET") {
      if (req?.query?.id) {
        const categoria = await CategoriaModel.findById(req?.query?.id);
        if (!categoria) {
          return res.status(400).json({ erro: "Categoria não encontrada" });
        }
        // Recupere todas as notícias dessa categoria
        const noticias = await NoticiaModel.find({ categoria: categoria._id });

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
        const { nomeCategoria } = req.query;
        const categoria = await CategoriaModel.findOne({
          nomeCategoria: nomeCategoria,
        });
        if (!categoria) {
          return res.status(400).json({ erro: "Categoria não encontrada" });
        }
        // Recupere todas as notícias dessa categoria
        const noticias = await NoticiaModel.find({ categoria: categoria._id });

        // Formate as notícias para a resposta
        const noticiasFormatadas = await Promise.all(
          noticias.map(async (noticia) => {
            // Encontre a categoria pelo _id da notícia
            const categoria = await CategoriaModel.findById(noticia.categoria);
            // Adicione o nome da categoria à notícia
            const noticiaFormatada = {
              titulo: noticia.titulo,
              materia: noticia.materia,
              foto: noticia.foto,
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
    }
    return res.status(405).json({ erro: "Metodo informado nao e valido" });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ erro: "Nao foi possivel buscar as notícias:" + e });
  }
};

export default politicaCORS(
  conectarMongoDB(listarNoticiasPorCategoriaEndpoint)
);
