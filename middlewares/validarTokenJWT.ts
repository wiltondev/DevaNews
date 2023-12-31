import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import type {RespostaPadraoMsg} from '../types/RespostaPadraoMsg';
import jwt, { JwtPayload } from 'jsonwebtoken';



interface AuthenticatedRequest extends NextApiRequest {
    user?: JwtPayload; 
  }





export const validarTokenJwt = (handler : NextApiHandler) =>

async(req : AuthenticatedRequest, res : NextApiResponse<RespostaPadraoMsg> ) => {

    try{
        const {MINHA_CHAVE_JWT} = process.env;

     
        if(!MINHA_CHAVE_JWT){
            return res.status(500).json({ erro : 'ENV chave JWT nao informada na execução do projeto'});
        }
    
        if(!req || !req.headers){
            return res.status(401).json({erro: 'Nao foi possível validar o token de acesso'});
        }
        
        if(req.method !== 'OPTIONS'){
            const authorization = req.headers['authorization'];
            if(!authorization){
                return res.status(401).json({erro: 'Nao foi possível validar o token de acesso'});
            }
    
            const token = authorization.substring(7);
            if(!token){
                return res.status(401).json({erro: 'erro ao validar o token de acesso'});
            }
    
            const decoded = jwt.verify(token, MINHA_CHAVE_JWT) as JwtPayload;
            if(!decoded){
                return res.status(401).json({erro: 'Nao foi possível validar o token de acesso'});
            }
            req.user = decoded;
           
            req.query.userId =decoded._id;
        
        }
        return await handler(req, res);
    }catch(e){
        console.log(e);
        return res.status(401).json({erro: 'Nao foi possível validar o token de acesso'});    
    }

}