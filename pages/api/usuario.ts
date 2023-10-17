import { NextApiRequest, NextApiResponse } from "next";
import { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import { validarTokenJwt } from "../../middlewares/validarTokenJWT";
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { UsuarioModel } from "../../Models/UsuarioModel";
import nc from "next-connect";
import { upload, uploadImagemCosmic } from "../../services/uploadImagemCosmic";
import { politicaCORS } from "../../middlewares/politicaCORS";

const handler = nc()
  .use(upload.single("file")) // Middleware para fazer upload de um arquivo

  // Rota PUT para atualizar informações do usuário
  .put(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
      const { userId } = req.query; // Obtém o ID do usuário da consulta
      const usuario = await UsuarioModel.findById(userId); // Procura o usuário pelo ID

      if (!usuario) {
        return res.status(400).json({ erro: "Usuário não encontrado" });
      }

      const { nome } = req?.body; // Obtém o novo nome do usuário dos dados da requisição

      if (nome && nome.length > 2) {
        usuario.nome = nome; // Atualiza o nome do usuário
      }

      const { file } = req; // Obtém o arquivo (imagem) enviado na requisição

      if (file && file.originalname) {
        const image = await uploadImagemCosmic(req); // Faz o upload da imagem
        if (image && image.media && image.media.url) {
          usuario.avatar = image.media.url; // Define a URL da imagem como o novo avatar do usuário
        }
      }

      await UsuarioModel.findByIdAndUpdate({ _id: usuario._id }, usuario); // Salva as atualizações no banco de dados

      return res.status(200).json({ msg: "Usuário alterado com sucesso" });
    } catch (e) {
      console.log(e);
      return res
        .status(400)
        .json({ erro: "Não foi possível atualizar o usuário: " + e });
    }
  })

  // Rota GET para obter informações do usuário
  .get(
    async (
      req: NextApiRequest,
      res: NextApiResponse<RespostaPadraoMsg | any>
    ) => {
      try {
        const { userId } = req?.query; // Obtém o ID do usuário da consulta
        const usuario = await UsuarioModel.findById(userId); // Procura o usuário pelo ID

        if (!usuario) {
          return res.status(400).json({ erro: "Usuário não encontrado" });
        }

        usuario.senha = null; // Define a senha como nula para não vazar informações confidenciais

        return res.status(200).json(usuario); // Retorna as informações do usuário
      } catch (e) {
        console.log(e);
        return res
          .status(400)
          .json({ erro: "Não foi possível obter dados do usuário" });
      }
    }
  )

  .delete(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
      const { noticiaId: id } = req.query;

      const user = await UsuarioModel.findById(id);
      if (!user) {
        return res.status(400).json({ erro: "Usuário não encontrado" });
      }

      await UsuarioModel.findByIdAndDelete(id);

      return res.status(200).json({ msg: "Usuário excluído com sucesso" });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ erro: "Erro ao excluir usuário" });
    }
  });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default politicaCORS(validarTokenJwt(conectarMongoDB(handler)));
