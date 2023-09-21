import multer from "multer";
import { createBucketClient } from "@cosmicjs/sdk";
import { getVideoDurationInSeconds } from 'get-video-duration';

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

// Função para fazer upload de imagem ou vídeo para o Cosmic
const uploadImagemCosmic = async (req: any, mediaType?: string,) => {
    try {
        // Verifique se um arquivo foi enviado
        if (!req?.file?.originalname) {
            throw new Error('Arquivo não fornecido');
        }

        // Obtenha informações sobre o arquivo
        const { originalname, buffer } = req.file;

        // Obtenha a extensão do arquivo em letras minúsculas
        const fileExtension = originalname.split('.').pop()?.toLowerCase();

        // Lista de extensões permitidas para imagens e vídeos
        const allowedImageFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
        const allowedVideoFormats = ['mp4', 'mov', 'avi', 'mkv', 'wmv'];

        // Verifique se a extensão do arquivo é permitida
        if (!allowedImageFormats.includes(fileExtension) && !allowedVideoFormats.includes(fileExtension)) {
            throw new Error('Extensão de arquivo inválida');
        }

        // Determine a pasta de destino com base na URL
        let folder = 'avatar'; // Padrão para URLs não correspondentes
        if (req.url) {
            if (req.url.includes("noticia")) {
                if (allowedVideoFormats.includes(fileExtension)) {
                    // Verifica se a rota contém "noticia" para processar vídeos de até 2 minutos
                    const videoDuration = await getVideoDurationInSeconds(buffer);
                    if (videoDuration > 120) {
                        throw new Error('Vídeo deve ter no máximo 2 minutos de duração.');
                    }
                    folder = 'noticia';
                } else {
                    folder = 'mediaNoticia';
                }
            }
        }

        // Insira o arquivo no Cosmic Bucket
        const media_object = {
            originalname,
            buffer,
        };
        const result = await bucketDevanews.media.insertOne({
            media: media_object,
            folder,
        });

        return result;
    } catch (error) {
        throw error; // Propague erros para serem tratados no código que chama esta função
    }
}

export { upload, uploadImagemCosmic };
