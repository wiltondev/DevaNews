// routes/categoria.js
import { NextApiRequest, NextApiResponse } from 'next';
import { CategoriaModel } from '../../Models/CategoriaModel';
import nc from 'next-connect';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJwt } from '../../middlewares/validarTokenJWT';
import { politicaCORS } from '../../middlewares/politicaCORS';
import { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import mongoose from 'mongoose';



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
  
      // Obtenha o parâmetro da URL que especifica o ID ou o nome da categoria
      const { categoriaParam } = req.query;
  
      // Se categoriaParam não for fornecido, retorne todas as categorias
      if (!categoriaParam) {
        const categorias = await CategoriaModel.find();
  
        const categoriasFormatadas = categorias.map((categoria) => ({
          nomeCategoria: categoria.nomeCategoria,
          _id: categoria._id.toString(),
        }));
  
        return res.status(200).json({ categorias: categoriasFormatadas });
      }
  
      
      let categoria;
  
      if (!mongoose.Types.ObjectId.isValid(categoriaParam)) {
        categoria = await CategoriaModel.findOne({ nomeCategoria: categoriaParam });
      } else {
        categoria = await CategoriaModel.findById(categoriaParam);
      }
  
      if (!categoria) {
        return res.status(404).json({ erro: 'Categoria não encontrada' });
      }
  
      return res.status(200).json({ categoria });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao listar ou buscar categoria' });
    }
  });
  

export default politicaCORS(validarTokenJwt(conectarMongoDB(handler))); 
  