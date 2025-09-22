import Joi from 'joi';

export function loginValidate(data: any) {
  const schema = Joi.object({
    codigoUsuario: Joi.string().required(),
    claveAcceso: Joi.string().required()
  }).options({ abortEarly: false });

  return schema.validate(data, { abortEarly: false });
}
