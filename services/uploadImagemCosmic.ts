import multer from "multer";
import { createBucketClient } from "@cosmicjs/sdk";

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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadImagemCosmic = async (req: any,) => {
    if (req?.file?.originalname) {
            const media_object = {
            originalname: req.file.originalname,
            buffer: req.file.buffer,
        };

        if (req.url && req.url.includes('noticia')) {
            return await bucketDevanews.media.insertOne({
                media: media_object,
                folder: "noticia" // Armazenar na pasta "noticia"
            });
        } else if (req.url && req.url.includes('cadastro')) {
            return await bucketDevanews.media.insertOne({
                media: media_object,
                folder: "avatar" // Armazenar na pasta "avatar"
            });
        } else {
            throw new Error('Rota inválida');
        }
    }
}

export  {upload, uploadImagemCosmic};