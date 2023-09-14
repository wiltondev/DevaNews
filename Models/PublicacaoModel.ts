import mongoose, { Schema } from "mongoose";


const PublicacaoSchema = new Schema({
    idUsuario: { type: String, required: true },
    descricao: { type: String, required: true },
    tipo: { type: String, required: true },
    data: { type: Date, required: true },
    largura: { type: Number},
    altura: { type: Number},
    duracao: { type: Number},
    URL: { type: String },
    comentarios: [
        {
            usuarioId: { type: String, required: true },
            nome: { type: String, required: true },
            comentario: { type: String, required: true },
            respostas: [
                {
                    respostaId: { type: String, required: true },
                    usuarioId: { type: String, required: true },
                    nome: { type: String, required: true },
                    resposta: { type: String, required: true }
                }
            ]
        }
    ],




    likes: { type: Array, required: true, default: [] },
});


export const PublicacaoModel = (mongoose.models.publicacoes || mongoose.model('publicacoes', PublicacaoSchema));


