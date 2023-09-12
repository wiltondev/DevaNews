
import mongoose from 'mongoose';

const NoticiaSchema = new mongoose.Schema({
  usuarioId: { 
    type: String,
     required: true,
     unique: true, // Chave primária
     index: true
    },

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



export const NoticiaModel = (mongoose.models.noticia || mongoose.model('noticia', NoticiaSchema));