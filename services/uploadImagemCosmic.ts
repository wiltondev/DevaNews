import multer from "multer";
import { createBucketClient } from "@cosmicjs/sdk";
import { getVideoDurationInSeconds } from 'get-video-duration';

const {
    BUCKET_SLUG,
    READ_KEY,
    WRITE_KEY
} = process.env;

const bucketDevanews = createBucketClient({
    bucketSlug: BUCKET_SLUG as string,
    readKey: READ_KEY as string,
    writeKey: WRITE_KEY as string
});

// Configuração de armazenamento para o multer (manter em memória)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Função para fazer upload de imagem ou vídeo para Cosmic
const uploadImagemCosmic = async (req: any, mediaType?: string) => {
    if (req?.file?.originalname) {
        // Verifica se a extensão do arquivo é suportada (imagem ou vídeo)
        if (
            !req.file.originalname.match(/\.(png|jpg|jpeg|mp4|mov)$/i)
        ) {
            throw new Error('Extensão de arquivo inválida');
        }

        // Verifica se o arquivo é uma imagem
        const isImage = /\.(png|jpg|jpeg)$/i.test(req.file.originalname);

        const media_object = {
            originalname: req.file.originalname,
            buffer: req.file.buffer,
        };

        if (req.url && req.url.includes("noticia")) {
            return await bucketDevanews.media.insertOne({
                media: media_object,
                folder: "noticia",
            });
        } else if (req.url && req.url.includes("usuario")) {
            return await bucketDevanews.media.insertOne({
                media: media_object,
                folder: "avatar",
            });
        } else if (req.url && req.url.includes("noticia") && mediaType === 'video') {
            // Verifica se a rota contém "reels" para processar vídeos de até 2 minutos
            const videoDuration = await getVideoDurationInSeconds(req.file.buffer);

             if (videoDuration > 120) {
                throw new Error('Vídeo deve ter no máximo 2 minutos de duração.');
            }
            return await bucketDevanews.media.insertOne({
                media: media_object,
                folder: "noticia",
            });
        } 
        }
    }


export { upload, uploadImagemCosmic };
