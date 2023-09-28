import mongoose, { Schema } from "mongoose";

// Esquema para representar as mídias vinculadas às notícias
const MediaSchema = new Schema({
  tipo: { type: String, enum: ["imagem", "video"], required: true },
  arquivo: { type: Buffer, required: true },
  noticiaId: { type: Schema.Types.ObjectId, ref: "Noticia", required: true },
});

// Modelo para a coleção de mídias
export const MediaModel = mongoose.model("Media", MediaSchema);
