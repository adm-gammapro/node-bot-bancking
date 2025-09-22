import Joi, { Root, StringSchema } from 'joi';
import moment from 'moment';

// Función personalizada para validar el formato de fecha esperado (DD-MM-YYYY)
const dateValidator = (joi: Root): StringSchema => {
  return joi.string().custom((value, helpers) => {
    const isValidDate = moment(value, 'YYYY-MM-DD', true).isValid();
    if (!isValidDate) {
      return helpers.error('string.date.invalid');
    }

    return value;
  }, 'Fecha con formato inválido. Utiliza el formato DD-MM-YYYY.');
};

export function validateData(data: any) {
  const schema = Joi.object({
    transactionId: Joi.string().required(),
    cuentaBancaria: Joi.string().required(),
    fechaInicio: dateValidator(Joi).required(),
    fechaFin: dateValidator(Joi).required()
  }).options({ abortEarly: false });

  return schema.validate(data, { abortEarly: false });
}
