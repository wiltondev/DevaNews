import type { NextApiRequest, NextApiResponse } from "next";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { politicaCORS } from "../../middlewares/politicaCORS";
import { CategoriaModel } from "../../Models/CategoriaModel";
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";

const listarCategoriasEndpoint = async (
  req: NextApiRequest,
  res: NextApiResponse<RespostaPadraoMsg | any[]>
) => {
  try {
    if (req.method === "GET") {
      const categorias = await CategoriaModel.find().sort({ nomeCategoria: 1 });

      const categoriasFormatadas = categorias.map((categoria) => ({
        nomeCategoria: categoria.nomeCategoria,
        _id: categoria._id.toString(),
      }));

      return res.status(200).json(categoriasFormatadas);
    }

    return res.status(405).json({ erro: "Metodo informado nao e valido" });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ erro: "Nao foi possivel buscar as categorias:" + e });
  }
};

export default politicaCORS(conectarMongoDB(listarCategoriasEndpoint));
