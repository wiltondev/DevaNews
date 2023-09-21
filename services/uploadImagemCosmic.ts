import multer from "multer";
import { createBucketClient } from "@cosmicjs/sdk";
import noticia from "../pages/api/noticia";
import usuario from "../pages/api/usuario";


// Obtenha as variáveis de ambiente
const {
    BUCKET_SLUG,
    READ_KEY,
    WRITE_KEY
} = process.env;

// Crie um cliente para o Cosmic Bucket
const bucketDevanews = createBucketClient({
    bucketSlug: BUCKET_SLUG as string,
    readKey: READ_KEY as string,
    writeKey: WRITE_KEY as string
});

// Configuração de armazenamento para o multer (manter em memória)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Função para fazer upload de arquivo para o Cosmic
const uploadImagemCosmic = async (req: any,) => {

    if (req?.file?.originalname) {

        if (
            !req.file.originalname.includes('.png') &&
            !req.file.originalname.includes('.jpg') &&
            !req.file.originalname.includes('.jpeg') &&
            !req.file.originalname.includes('.gif') &&
            !req.file.originalname.includes('.mp4') &&
            !req.file.originalname.includes('.mov') &&
            !req.file.originalname.includes('.wmv') &&
            !req.file.originalname.includes('.avi')
        ) {
            throw new Error('extensão de arquivo inválido');
        }
        const media_oject = {
            originalName: req.file.originalname,
            buffer: req.file.buffer,
        };

        if (req.url && req.url.includes('noticia')) {
            return await bucketDevanews.media.insertOne({
                media: media_oject,
                folder: "noticia"
            });
        } else { req.url && req.url.includes('usuario') } {
            return await bucketDevanews.media.insertOne({
                media: media_oject,
                folder: "avatar"
            });


        }
    }
}

export { upload, uploadImagemCosmic }
