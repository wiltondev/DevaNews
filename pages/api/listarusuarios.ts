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

  // Rota GET para obter informações do usuário
  .get(
    async (
      req: NextApiRequest,
      res: NextApiResponse<RespostaPadraoMsg | any>
    ) => {
      try {
        if (req?.query?.id) {
          const usuario = await UsuarioModel.findById(req?.query?.id);

          if (!usuario) {
            return res.status(400).json({ erro: "Usuário não encontrado" });
          }

          usuario.senha = null;

          return res.status(200).json(usuario);
        } else {
          const usuarios = await UsuarioModel.find(); // Procura o usuário pelo ID

          if (!usuarios) {
            return res.status(400).json({ erro: "Usuário não encontrado" });
          }

          const usuariosFormatados = await Promise.all(
            usuarios.map(async (usuario) => {
              const usuarioFormatado = {
                nome: usuario.nome,
                email: usuario.email,
                senha: null,
                avatar: usuario.avatar,
                _id: usuario._id.toString(),
              };
              return usuarioFormatado;
            })
          );

          return res.status(200).json(usuariosFormatados); // Retorna as informações do usuário
        }
      } catch (e) {
        console.log(e);
        return res
          .status(400)
          .json({ erro: "Não foi possível obter dados do usuário" });
      }
    }
  );

export const config = {
  api: {
    bodyParser: false,
  },
};

export default politicaCORS(validarTokenJwt(conectarMongoDB(handler)));
