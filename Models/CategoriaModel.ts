import mongoose, { Document } from 'mongoose';

// Defina a interface para Categoria
export interface Categoria extends Document {
  nomeCategoria: string;
}

const categoriaSchema = new mongoose.Schema({
  nomeCategoria: {
    type: String,
    required: true,
  },
});


export const CategoriaModel = mongoose.models.Categoria || mongoose.model<Categoria>('Categoria', categoriaSchema);
