import mongoose, { Schema } from "mongoose";

const NoticiaSchema = new Schema({
    idUsuario: { type: String, required: true },
    titulo: { type: String, required: true, maxlength: 200 },
    materia: { type: String, required: true, minlength: 2, maxlength: 3000 },
    categoria: { type: String, maxlength: 30 },
    tipo: { type: String, required: true },
    data: { type: Date, required: true },
    largura: { type: Number },
    altura: { type: Number },
    duracao: { type: Number },
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

export const NoticiaModel = (mongoose.models.noticias || mongoose.model('noticias', NoticiaSchema));
