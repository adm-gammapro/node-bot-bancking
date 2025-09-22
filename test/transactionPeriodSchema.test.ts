import { validateData } from '../src/middleware/validators/transactionPeriodSchema'; // Asegúrate de importar correctamente la función validateData

describe('validateData', () => {
  it('debería retornar error para fecha con formato inválido', () => {
    const data = {
      codigoEmpresa: 'E001',
      codigoUsuario: 'U001',
      claveAcceso: 'secreto123',
      cuentaBancaria: '1234567890',
      fechaInicio: '2021-15-30', // Fecha con formato inválido
      fechaFin: '2022-12-31' // Fecha con formato válido
    };

    const result = validateData(data);
    expect(result.error).toBeDefined();
    expect(result.error?.details[0].message).toBe(
      'Error code "string.date.invalid" is not defined, your custom type is missing the correct messages definition'
    );
  });

  it('debería retornar error para datos faltantes', () => {
    const data = {
      codigoEmpresa: 'E001',
      codigoUsuario: 'U001',
      claveAcceso: 'secreto123'
    };

    const result = validateData(data);
    expect(result.error).toBeDefined();
    expect(result.error?.details).toHaveLength(3); // Cantidad de campos requeridos que faltan
  });

  it('debería validar correctamente datos válidos', () => {
    const data = {
      codigoEmpresa: 'E001',
      codigoUsuario: 'U001',
      claveAcceso: 'secreto123',
      cuentaBancaria: '1234567890',
      fechaInicio: '2021-04-01', // Fecha con formato válido
      fechaFin: '2021-04-30' // Fecha con formato válido
    };

    const result = validateData(data);
    expect(result.error).toBeUndefined();
    expect(result.value).toEqual(data);
  });
});
