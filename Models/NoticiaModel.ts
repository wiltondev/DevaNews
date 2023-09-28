import mongoose, { Schema } from 'mongoose';

const NoticiaSchema = new Schema({
  idUsuario: { type: String, required: true },
  titulo: { type: String, required: true, maxlength: 200 },
  materia: { type: String, required: true, minlength: 2, maxlength: 3000 },
  categoria: {
    type: mongoose.Schema.Types.ObjectId, //  ID da categoria
    ref: 'Categoria', // Nome da categoria
    required: true,
  },
  file: { type: String, required: true },
  tipo: { type: String, enum: ["video", "foto"], required: true },
  arquivo: { type: Buffer, required: true },
  data: { type: Date, required: true },
});

export const NoticiaModel = mongoose.models.noticias || mongoose.model('noticias', NoticiaSchema);
