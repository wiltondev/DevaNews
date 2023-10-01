import mongoose, { Document, Schema } from 'mongoose';

// Defina a interface para Notícia
export interface Noticia extends Document {
  idUsuario: string;
  titulo: string;
  materia: string;
  categoria: Schema.Types.ObjectId; // ID da categoria à qual a notícia pertence
  foto: string;
  video: string;
  data: Date;
}

const NoticiaSchema = new Schema({
  idUsuario: { type: String, required: true },
  titulo: { type: String, required: true, maxlength: 200 },
  materia: { type: String, required: true, minlength: 2, maxlength: 3000 },
  categoria: {
    type: mongoose.Schema.Types.ObjectId, //  ID da categoria
    ref: 'Categoria', // Nome da categoria
    required: true,
  },
  foto: { type: String, required: false },
  video: { type: String, required: false },
  data: { type: Date, required: true },
});

export const NoticiaModel = mongoose.models.noticias || mongoose.model('noticias', NoticiaSchema);
