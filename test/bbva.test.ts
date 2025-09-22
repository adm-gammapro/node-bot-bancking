import bbva from '../src/automator/bbva';

describe('BBVA', () => {
  it('debería obtener el saldo correctamente', async () => {
    // Datos de prueba
    const data = {
      codigoEmpresa: process.env.BBVA_CODIGO_EMPRESA,
      codigoUsuario: process.env.BBVA_CODIGO_USUARIO,
      claveAcceso: process.env.BBVA_CLAVE_ACCESO,
      cuentaBancaria: process.env.BBVA_CUENTA_BANCARIA2
    };

    const bot = await bbva.start(data);

    const result = await bot.handleViewBalance();

    expect(result).toHaveProperty('afavor');
    expect(result).toHaveProperty('encontra');
  });

  it('debería obtener el saldo correctamente', async () => {
    // Datos de prueba
    const data = {
      codigoEmpresa: process.env.BBVA_CODIGO_EMPRESA,
      codigoUsuario: process.env.BBVA_CODIGO_USUARIO,
      claveAcceso: process.env.BBVA_CLAVE_ACCESO,
      cuentaBancaria: process.env.BBVA_CUENTA_BANCARIA1,
      fechaInicio: process.env.BBVA_FECHA_INICIO,
      fechaFin: process.env.BBVA_FECHA_FIN
    };

    const bot = await bbva.start(data);

    const result = await bot.handleTransactionPeriod();

    const objetoReferencia = {
      fecha_operacion: expect.any(String),
      fecha_valor: expect.any(String),
      codigo: expect.any(String),
      num_doc: expect.any(String),
      concepto: expect.any(String),
      importe: expect.any(String),
      oficina: expect.any(String)
    };

    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining(objetoReferencia)])
    );
  });

  // Puedes escribir más pruebas para otros escenarios y casos límite
});
