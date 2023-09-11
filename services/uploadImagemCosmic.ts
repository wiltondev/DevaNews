import multer from "multer";
import { createBucketClient } from "@cosmicjs/sdk";

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
const uploadImagemCosmic = async (req: any, mediaType: string = "materia") => {
    if (req?.file?.originalname) {
        // Verifica se a extensão do arquivo é suportada (imagem ou vídeo)
        const supportedExtensions = /\.(png|jpg|jpeg|mp4)$/i;
        if (!supportedExtensions.test(req.file.originalname)) {
            throw new Error("Extensão de arquivo não suportada.");
        }

        // Verifica se o arquivo é uma imagem
        const isImage = /\.(png|jpg|jpeg)$/i.test(req.file.originalname);

        const media_object = {
            originalname: req.file.originalname,
            buffer: req.file.buffer,
        };

        let folder = mediaType;
        if (isImage && mediaType === "usuario") {
            folder = "avatar";
        }

        return await bucketDevanews.media.insertOne({
            media: media_object,
            folder: folder,
        });
    }
    throw new Error("Nenhum arquivo para fazer upload.");
};

export { upload, uploadImagemCosmic };

