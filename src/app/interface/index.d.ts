
import { JwtPayload } from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload | null
      bucketType?: string
      uploadPath?: string
      
    }
  }
}

declare global {
  namespace Express {
    interface Request {
      files?: {
        location: string
        key: string
      }
      uploadSize?: number
    }

    interface MulterFile extends Multer.File {
      location?: string
      key?: string
    }

    interface MulterFile {
      buffer: Buffer
      fieldname: string
      originalname: string
      encoding: string
      mimetype: string
      size: number
      key: string
    }
  }
}
