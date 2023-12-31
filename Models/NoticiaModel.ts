import mongoose, { Document, Schema } from "mongoose";

// Defina a interface para Notícia
export interface Noticia extends Document {
  idUsuario: string;
  titulo: string;
  materia: string;
  categoria: Schema.Types.ObjectId; // ID da categoria à qual a notícia pertence
  url: string;
  id: string;
  data: Date;
  dataAtualizada: Date;
}

const NoticiaSchema = new Schema({
  idUsuario: { type: String, required: true },
  titulo: { type: String, required: true, maxlength: 200 },
  materia: { type: String, required: true, minlength: 2, maxlength: 10000 },
  categoria: {
    type: mongoose.Schema.Types.ObjectId, //  ID da categoria
    ref: "Categoria", // Nome da categoria
    required: true,
  },
  url: { type: String, required: true },
  mediaId: { type: String, required: true },
  data: { type: Date, required: true },
  dataAtualizada: { type: Date, required: false },
});

NoticiaSchema.index({ titulo: "text", categoria: "text", materia: "text" });

export const NoticiaModel =
  mongoose.models.noticias || mongoose.model("noticias", NoticiaSchema);
