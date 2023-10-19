import type { NextApiResponse } from "next";
import nc from "next-connect";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { NoticiaModel } from "../../Models/NoticiaModel";
import { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import { politicaCORS } from "../../middlewares/politicaCORS";
import { CategoriaModel } from "../../Models/CategoriaModel";



const pesquisaHandler = nc()
    .get(async (req: any, res: NextApiResponse<RespostaPadraoMsg | any>) => {
        try {
            const { filtro } = req.query; // Use "filtro" como o parâmetro de pesquisa

            if (!filtro) {
                return res.status(400).json({ erro: "Filtro de pesquisa é obrigatório" });
            }

            const categorias = await CategoriaModel.find({ nomeCategoria: { $regex: filtro, $options: 'i' } });
            const categoriaIds = categorias.map(categoria => categoria._id);

            const resultados = await NoticiaModel.find({
                $or: [
                    {categoria:{ $in: categoriaIds}},
                    { titulo: { $regex: filtro , $options: "i"} },
                    { materia: { $regex: filtro , $options: "i"} }
                ]
            })

            const resultadoFormatado = await Promise.all(
                resultados.map(async (noticia) => {
                    const categoria = await CategoriaModel.findById(noticia.categoria);
                    const noticiaFormatada = {
                        titulo: noticia.titulo,
                        materia: noticia.materia,
                        url: noticia.url,
                        video: noticia.video,
                        data: noticia.data,
                        categoria: categoria ? categoria?.nome : null,
                        categoriaId: noticia.categoria,
                        _id: noticia._id.toString(),
                    };
                    return noticiaFormatada;
                })
            );

            if (resultadoFormatado.length === 0) {
                return res.status(200).json({ mensagem: "Desculpe, não conseguimos encontrar nenhuma notícia que corresponda à sua pesquisa. Por favor, tente com outra palavra." });
              } else {
                return res.status(200).json({ resultados: resultadoFormatado });
              }

         } catch (e) {
            console.error(e);
            return res.status(400).json({ erro: 'Erro ao realizar a pesquisa' });
        }
    });

export default politicaCORS(conectarMongoDB(pesquisaHandler));
