import mongoose, { Document, Schema, Types } from 'mongoose';


export interface Categoria extends Document {
  nomeCategoria: string;
  noticias: Types.ObjectId[]; // Array de IDs de notícias relacionadas a esta categoria
}

const categoriaSchema = new Schema({
  nomeCategoria: {
    type: String,
    required: true,
  },
  noticias: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Noticia', // Nome do modelo de notícia
    },
  ],
});

export const CategoriaModel = mongoose.models.Categoria || mongoose.model<Categoria>('Categoria', categoriaSchema);
