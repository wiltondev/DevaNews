
import mongoose from 'mongoose';

const noticiaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    maxlength: 200,
  },
  conteudo: {
    type: String,
    required: true,
    maxlength: 3000,
  },
  autor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario', // Referência ao modelo de usuário
    required: true,
  },
  dataPublicacao: {
    type: Date,
    default: Date.now,
  },
});

const noticiaModel = mongoose.model('Noticia', noticiaSchema);

export default noticiaModel;
