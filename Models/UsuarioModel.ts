import mongoose, { Schema } from "mongoose";

const UsuarioSchema = new Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true },
  senha: { type: String, required: true },
  avatar: { type: String, required: false },
});

export const UsuarioModel =
  mongoose.models.usuarios || mongoose.model("usuarios", UsuarioSchema);
