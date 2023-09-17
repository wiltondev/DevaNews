const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  noticiaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Noticia',
    required: true,
  },
  nomeArquivo: {
    type: String,
    required: true,
  },
});



 export const MediaModel =( mongoose.model.media || mongoose.model('materia', mediaSchema));