// routes/categoria.js
import { NextApiRequest, NextApiResponse } from 'next';
import { CategoriaModel } from '../../Models/CategoriaModel';
import nc from 'next-connect';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJwt } from '../../middlewares/validarTokenJWT';
import { politicaCORS } from '../../middlewares/politicaCORS';
import { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';



const handler = nc()

.post(async (req: any, res: NextApiResponse<RespostaPadraoMsg | any >) => {
    try {
      const { nomeCategoria } = req.body;

      // Verifique se o nome da categoria já existe
      const categoriaExistente = await CategoriaModel.findOne({ nomeCategoria });
      if (categoriaExistente) {
        return res.status(400).json({ erro: 'Categoria já existe' });
      }

      // Crie uma nova categoria
      const novaCategoria = new CategoriaModel({ nomeCategoria });
      await novaCategoria.save();

      return res.status(201).json(novaCategoria);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao criar categoria' });

    };
  });

  handler.get(async (req: any, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
      if (req.method !== 'GET') {
        return res.status(405).json({ erro: 'Método não permitido' });

    }
    
      const categorias = await CategoriaModel.find();

      const categoriasFormatadas = categorias.map((categoria) => ({
          nomeCategoria: categoria.nomeCategoria,
          _id: categoria._id.toString(),
      }));

      

     return res.status(200).json({ categorias: categoriasFormatadas });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao listar categorias' });
    }
  });

export default politicaCORS(validarTokenJwt(conectarMongoDB(handler))); 
  