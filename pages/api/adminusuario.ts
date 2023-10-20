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

  .put(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
      const { id } = req?.query;
      const usuario = await UsuarioModel.findById(id);

      if (!usuario) {
        return res.status(400).json({ erro: "Usuario nao encontrado" });
      }

      const { nome } = req?.body;
      if (nome && nome.length > 2) {
        usuario.nome = nome;
      }

      const { file } = req;
      if (file && file.originalname) {
        const image = await uploadImagemCosmic(req);
        console.log(image);
        if (image && image.media && image.media.url) {
          usuario.avatar = image?.media?.url;
        }
      }

      await UsuarioModel.findByIdAndUpdate({ _id: usuario._id }, usuario);

      return res.status(200).json({ msg: "Usuario alterado com sucesos" });
    } catch (e) {
      console.log(e);
      return res
        .status(400)
        .json({ erro: "Nao foi possivel atualizar usuario:" + e });
    }
  })

  .delete(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
    try {
      const { id } = req.query;

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
