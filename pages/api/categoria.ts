// routes/categoria.js
import { NextApiRequest, NextApiResponse } from "next";
import { CategoriaModel } from "../../Models/CategoriaModel";
import nc from "next-connect";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { validarTokenJwt } from "../../middlewares/validarTokenJWT";
import { politicaCORS } from "../../middlewares/politicaCORS";
import { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";

const handler = nc().post(
  async (req: any, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
      let { nomeCategoria } = req.body;
      // nomeCategoria = nomeCategoria.toLowerCase();

      // Verifique se o nome da categoria já existe
      const categoriaExistente = await CategoriaModel.findOne({
        nomeCategoria,
      });
      if (categoriaExistente) {
        return res.status(400).json({ erro: "Categoria já existe" });
      }

      // Crie uma nova categoria
      const novaCategoria = new CategoriaModel({ nomeCategoria });
      await novaCategoria.save();

      return res.status(201).json(novaCategoria);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro ao criar categoria" });
    }
  }
);
handler.put(async (req: any, res: NextApiResponse<RespostaPadraoMsg | any>) => {
  try {
    let { id } = req.query;
    let { nomeCategoria } = req.body;

    // Encontre a categoria pelo ID e atualize o nome
    const categoria = await CategoriaModel.findById(id);

    if (!categoria) {
      return res.status(400).json({ erro: "Categoria não encontrada" });
    }

    await CategoriaModel.findByIdAndUpdate(
      { _id: id },
      { nomeCategoria: nomeCategoria }
    );

    return res.status(200).json({ msg: "Categoria atualizada com sucesso" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao atualizar categoria" });
  }
});

handler.delete(
  async (req: any, res: NextApiResponse<RespostaPadraoMsg | any>) => {
    try {
      const { id } = req.query;

      // Encontre a categoria pelo ID e delete
      const categoria = await CategoriaModel.findById(id);

      if (!categoria) {
        return res.status(400).json({ erro: "Categoria não encontrada" });
      }

      await CategoriaModel.findByIdAndDelete(id);

      return res
        .status(200)
        .json({ mensagem: "Categoria deletada com sucesso" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro ao deletar categoria" });
    }
  }
);

handler.get(async (req: any, res: NextApiResponse<RespostaPadraoMsg | any>) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ erro: "Método não permitido" });
    }

    const categorias = await CategoriaModel.find().sort({ nomeCategoria: 1 });

    const categoriasFormatadas = categorias.map((categoria) => ({
      nomeCategoria: categoria.nomeCategoria,
      _id: categoria._id.toString(),
    }));

    return res.status(200).json({ categorias: categoriasFormatadas });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao listar categorias" });
  }
});

export default politicaCORS(validarTokenJwt(conectarMongoDB(handler)));
