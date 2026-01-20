import mongoose from 'mongoose';
import { IGenericErrorMessage, TErrorSources } from '../interface/error';




const handleCastError = (error: mongoose.Error.CastError) => {
  const errors: IGenericErrorMessage[] = [
    {
      path: error.path,
      message: "Invalid Id",
    },
  ];
  ;

  const statusCode = 400;
  return {
    statusCode,
    message: "Cast Error",
    errorSources: errors,
  };
};

export default handleCastError;
