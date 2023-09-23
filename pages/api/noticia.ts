// Importações de módulos e middlewares necessários
import type { NextApiResponse } from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import nc from 'next-connect';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { validarTokenJwt } from '../../middlewares/validarTokenJWT';
import { NoticiaModel } from '../../Models/NoticiaModel';
import { UsuarioModel } from '../../Models/UsuarioModel';
import { politicaCORS } from '../../middlewares/politicaCORS';

// Crie um manipulador usando next-connect
const handler = nc();

// Manipulador para criar uma nova notícia (POST)
handler.post(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
  try {
    // Obtenha o ID do usuário a partir dos parâmetros da consulta
    const { userId } = req.query;
    const data = req.body
    if(req.method !== 'POST'){
      return res.status(400).json({ erro: 'Metodo não permitido' });
    }

    
    // Verifique se o usuário existe no banco de dados
    const usuario = await UsuarioModel.findById(userId);
    if (!usuario) {
      return res.status(400).json({ erro: 'Usuário não encontrado' });
    }

    const titulo : string = data?.titulo;
    const materia : string = data?.materia;
    const categoria : string = data?.categoria;
    console.log('titulo', titulo);
    // Valide os campos de entrada, como o título, matéria e categoria
    if (!titulo || titulo.length > 200) {
      return res.status(400).json({ erro: 'Título inválido' });
    }

    if (!materia || materia.length < 2 || materia.length > 3000) {
      return res.status(400).json({ erro: 'Matéria inválida' });
    }

    if (!categoria || categoria.length > 30) {
      return res.status(400).json({ erro: 'Categoria inválida' });
    }

    // Crie um objeto de notícia com os detalhes
    const noticia = {
      idUsuario: usuario._id,
      titulo,
      materia,
      categoria,
      data: new Date(),
    };

    // Crie a notícia no banco de dados
    const noticiaCriada = await NoticiaModel.create(noticia);

    // Retorne a resposta com sucesso e o ID da notícia criada
    return res.status(200).json({ msg: 'Matéria criada com sucesso', noticiaId: noticiaCriada._id });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ erro: 'Erro ao cadastrar notícia' });
  }
});

// Manipulador para atualizar uma notícia (PATCH)
handler.patch(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
  try {
    // Obtenha o ID do usuário autenticado a partir dos dados personalizados
    const { userId } = req.query;

    // Obtenha o ID da notícia a partir dos parâmetros da consulta
    const noticiaId = req.query.noticiaId;

    // Obtenha os dados da solicitação
    const data = req.body;

    // Valide a solicitação PATCH
    if (req.method !== 'PATCH') {
      return res.status(405).json({ erro: 'Método não permitido' });
    }

    // Verifique se o usuário existe no banco de dados
    const usuario = await UsuarioModel.findById(userId);
    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    // Verifique se a notícia pertence ao usuário autenticado
    const noticiasMinhas = await NoticiaModel.find({ _id: noticiaId, idUsuario: userId });
    if (!noticiasMinhas || noticiasMinhas.length === 0) {
      return res.status(400).json({ erro: 'Notícia não encontrada' });
    }

    // Valide o corpo da solicitação
    if (!data.titulo || data.titulo.length > 200) {
      return res.status(400).json({ erro: 'Título inválido DEVE CONTER DE 2 ATE 200 CARACTERES' });
    }

    if (!data.materia || data.materia.length < 2 || data.materia.length > 3000) {
      return res.status(400).json({ erro: 'Matéria inválida DEVE CONTER DE 2 ATE 3000 CARACTERES' });
    }

    if (!data.categoria || data.categoria.length > 30) {
      return res.status(400).json({ erro: 'Categoria inválida DEVE CONTER DE 1 ATE 30 CARACTERES' });
    }

    // Atualize a notícia com os novos dados
    const noticiaAtualizada = await NoticiaModel.findOneAndUpdate(
      { _id: noticiaId },
      { $set: data },
      { new: true }
    );

    // Retorne a resposta com sucesso e o ID da notícia atualizada
    return res.status(200).json({ msg: 'Notícia atualizada com sucesso', noticiaId: noticiaAtualizada._id });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ erro: 'Erro ao atualizar notícia' });
  }
});

// Manipulador para excluir uma notícia (DELETE)
handler.delete(async (req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
  try {
    // Obtenha o ID da notícia a partir dos parâmetros da consulta
    const { noticiaId } = req.query;

    // Obtenha o ID do usuário autenticado a partir dos dados da solicitação
    const userId = req.user;

    // Verifique se o usuário existe no banco de dados
    const usuario = await UsuarioModel.findById(userId);
    if (!usuario) {
      return res.status(400).json({ erro: 'Usuário não encontrado' });
    }

    // Verifique se a notícia pertence ao usuário autenticado
    const noticiasMinhas = await NoticiaModel.find({ _id: noticiaId, idUsuario: usuario._id });
    if (noticiasMinhas && noticiasMinhas.length > 0) {
      // Exclua a notícia do banco de dados
      await NoticiaModel.deleteOne({ _id: noticiaId, idUsuario: usuario._id });
      return res.status(200).json({ msg: 'Notícia deletada com sucesso' });
    }

    return res.status(400).json({ erro: 'Notícia não encontrada' });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ erro: 'Erro ao deletar notícia' });
  }
});
   
handler.options((req: any, res: NextApiResponse<RespostaPadraoMsg>) => {
  // Defina os cabeçalhos CORS necessários para permitir solicitações de diferentes origens (domínios)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Retorne a resposta com sucesso
  return res.status(200).end();
});


   export default politicaCORS(validarTokenJwt(conectarMongoDB(handler)));
