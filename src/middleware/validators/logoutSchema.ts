import Joi from 'joi';

export default function Schema(data: any) {
  const schema = Joi.object({
    transactionId: Joi.string().required()
  }).options({ abortEarly: false });

  return schema.validate(data, { abortEarly: false });
}
