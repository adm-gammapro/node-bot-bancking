import Joi from 'joi';

export function validateData(data: any) {
  const schema = Joi.object({
    transactionId: Joi.string().required(),
    cuentaBancaria: Joi.string().required()
  }).options({ abortEarly: false });

  return schema.validate(data, { abortEarly: false });
}
