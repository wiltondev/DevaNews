// routes/noticias.js
import { NextApiRequest, NextApiResponse } from 'next';
import { NoticiaModel } from '../../Models/NoticiaModel';
import { CategoriaModel } from '../../Models/CategoriaModel';
import nc from 'next-connect';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJwt } from '../../middlewares/validarTokenJWT';
import { politicaCORS } from '../../middlewares/politicaCORS';
import { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';

const handler = nc()

.get(async (req: any, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
        let { categoriaId, nomeCategoria } = req.query;

        if (nomeCategoria) {
            nomeCategoria = nomeCategoria.toLowerCase();
        }

        let categoria;
        if (categoriaId) {
            // Se um categoriaId foi fornecido, encontre a categoria por ID
            categoria = await CategoriaModel.findById(categoriaId);
        } else if (nomeCategoria) {
            // Se um nomeCategoria foi fornecido, encontre a categoria por nome
            categoria = await CategoriaModel.findOne({ nomeCategoria: nomeCategoria });
        }

        if (!categoria) {
            return res.status(400).json({ erro: 'Categoria não encontrada' });
        }

        // Recupere todas as notícias dessa categoria
        const noticias = await NoticiaModel.find({ categoria: categoria._id });

        // Formate as notícias para a resposta
        const noticiasFormatadas = noticias.map((noticia) => ({
            titulo: noticia.titulo,
            materia: noticia.materia,
            foto: noticia.foto,
            video: noticia.video,
            data: noticia.data,
            _id: noticia._id.toString(),
        }));

        return res.status(200).json({ noticias: noticiasFormatadas });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao listar notícias' });
    }
});

export default politicaCORS(validarTokenJwt(conectarMongoDB(handler)));

