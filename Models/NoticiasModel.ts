import mongoose, { Schema } from "mongoose";

const NoticiaSchema = new Schema({
    
  titulo: { type: String, required: true }, // o título da notícia
  conteudo: { type: String, required: true }, // o conteúdo da notícia
  autor: { type: Schema.Types.ObjectId, ref: "usuarios", required: true }, // o autor da notícia, referenciando o modelo de usuário
  categoria: { type: String, enum: ["Política", "Esporte", "Cultura", "Economia", "Saúde", "Tecnologia"], required: true }, // a categoria da notícia
  data: { type: Date, default: Date.now }, // a data de publicação da notícia
  imagem: { type: String, required: false }, // uma imagem relacionada à notícia
  comentarios: [{ type: Schema.Types.ObjectId, ref: "comentarios" }], // os comentários feitos pelos leitores da notícia
  curtidas: { type: Number, default: 0 }, // o número de curtidas que a notícia recebeu
});

export const NoticiaModel = (mongoose.models.noticias || mongoose.model("noticias", NoticiaSchema));



