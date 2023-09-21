import mongoose, { Schema } from "mongoose";

const NoticiaSchema = new Schema({
    idUsuario: { type: String, required: true },
    titulo: { type: String, required: true, maxlength: 200 },
    materia: { type: String, required: true, minlength: 2, maxlength: 3000 },
    categoria: { type: String, maxlength: 30 },
    data: { type: Date, required: true },
    
  
});

export const NoticiaModel = (mongoose.models.noticias || mongoose.model('noticias', NoticiaSchema));
