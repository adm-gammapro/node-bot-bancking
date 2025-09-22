import Joi from 'joi';

export function validateData(data: any) {
  const schema = Joi.object({
    codigoEmpresa: Joi.string().required(),
    codigoUsuario: Joi.string().required(),
    claveAcceso: Joi.string().required()
  }).options({ abortEarly: false });

  return schema.validate(data, { abortEarly: false });
}
