import { Page } from 'puppeteer';
import cheerio from 'cheerio';
import moment from 'moment';

import logger from '../../utils/logger';
import AutomatorError from '../automatorError';

class viewBalance {
  private readonly page: Page;
  private readonly data: any;

  constructor(page: Page, data: any) {
    this.page = page;
    this.data = data;
  }

  formatearAccount(accountNumber: string) {
    // Verifica si la longitud del número es válida
    if (accountNumber.length !== 25) {
      return accountNumber;
    }

    accountNumber = accountNumber.slice(5);

    // Formatea el número insertando guiones en las posiciones adecuadas
    const accountNumberFormateado = `${accountNumber.slice(
      0,
      8
    )}${accountNumber.slice(10, 20)}`;

    return accountNumberFormateado;
  }

  todayInPeriod(periodStart: string, periodEnd: string) {
    const today = moment().format('YYYY-MM-DD');
    if (periodStart == today || periodEnd == today) {
      return true;
    }
    return false;
  }

  formatNumber(amount: string) {
    return parseFloat(amount.replace(/,/g, ''));
  }

  public async execute(): Promise<any> {
    const account_bank = this.data.cuentaBancaria;
    if (!this.page) {
      throw new Error('Page not initialized. Call initialize() first.');
    }

    logger.info('Navigating in the menu to the view...');
    await this.page.click('#kyop-menuOption-000000200A-menuLeft');

    await this.page.waitForSelector(
      '#kyop-opcionMenuHija_m_000000210F-menuLeft',
      {
        visible: true
      }
    );
    await this.page.click('#kyop-opcionMenuHija_m_000000210F-menuLeft');

    logger.info('Validating view and applying search filters...');
    const elementHandleFrame = await this.page.waitForSelector(
      '#kyop-central-load-area'
    );
    if (!elementHandleFrame) throw new Error('FRAME NO CARGADO');

    const frame = await elementHandleFrame.contentFrame();
    if (!frame) throw new Error('Error al buscar el frame');

    await new Promise(resolve => setTimeout(resolve, 3000));

    const selectElement = await frame.$(
      'body > form > div > div > div:nth-child(1) > div.section > table > tbody > tr:nth-child(2) > td:nth-child(2) > select'
    );
    if (!selectElement) throw new Error('Select no ubicado');

    const options = await selectElement.$$('option');

    let account_bank_active = false;
    for (const option of options) {
      const optionValue = await frame.evaluate((el) => el.value, option);
      if (this.formatearAccount(optionValue) == account_bank) {
        account_bank_active = true;
        await option.click();
        break;
      }
    }

    if (!account_bank_active) {
      throw new AutomatorError(
        `La cuenta ${account_bank}, no fue encontrada en la plataforma de BBVA.`
      );
    }

    await frame.click(
      'body > form > div > div > div:nth-child(2) > div.section > table > tbody > tr:nth-child(2) > td:nth-child(2) > label'
    );

    await frame.type(
      '#fechaDesde',
      moment(this.data.fechaInicio, 'YYYY-MM-DD').format('DD-MM-YYYY')
    );

    await frame.type(
      '#fechaHasta',
      moment(this.data.fechaFin, 'YYYY-MM-DD').format('DD-MM-YYYY')
    );

    await frame.click(
      'body > form > div > div > div.formActionButtons > div > input'
    );

    await new Promise(resolve => setTimeout(resolve, 5000));

    logger.info('Downloaded results...');

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const UrlVerExcel = await frame.evaluate(() => window.UrlVerExcel);
    if (!UrlVerExcel)
      throw new Error('Url de descarga del archivo excel no encontrado');

    const result = await frame.evaluate(async () => {
      function bufferToBase64(buffer: any) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      }

      const response = await fetch(UrlVerExcel);
      const buffer = await response.arrayBuffer();
      const base64Data = bufferToBase64(buffer);
      return base64Data;
    });

    if (!result)
      throw new Error(
        'No se obtuvo el archivo excel con la informacion de los movimientos'
      );

    logger.info('Result downloaded successfully.');

    logger.info('Processing Results...');
    const buffer = Buffer.from(result, 'base64');
    const text = buffer.toString('utf-8');

    const cheerio_load = cheerio.load(text);
    const jsonData: any = [];

    cheerio_load('tr').each((index, element) => {
      const row = {};
      cheerio_load(element)
        .find('td')
        .each((index, element) => {
          const columnName = `column${index + 1}`;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          row[columnName] = cheerio_load(element).text().trim();
        });

      jsonData.push(row);
    });

    const DATA = jsonData
      .filter((row: any) => Object.keys(row).length === 7)
      .filter((row: any) => row['column1'] !== '')
      .map((row: any) => ({
        fecha_operacion: row['column1'],
        fecha_valor: row['column2'],
        // codigo: row['column3'],
        // num_doc: row['column4'],
        concepto: row['column5'],
        // importe: row['column6'],
        cargo:
          this.formatNumber(row['column6']) < 0
            ? Math.abs(this.formatNumber(row['column6']))
            : 0,
        abono:
          this.formatNumber(row['column6']) > 0
            ? this.formatNumber(row['column6'])
            : 0
        // oficina: row['column7']
      }))
      .slice(1);

    const hasTodayInPeriod = this.todayInPeriod(
      this.data.fechaInicio,
      this.data.fechaFin
    );

    // Movimientos del dia
    if (hasTodayInPeriod) {
      await this.page.evaluate(() => {
        const menuOption000000200A = document.querySelector<HTMLElement>(
          '#kyop-opcionMenuHija_m_000000210G-menuLeft'
        );

        if (menuOption000000200A == null) {
          throw new Error('Item <Movimientos del dia> del menu no encontrado.');
        }

        menuOption000000200A.click();
      });
      // ITEM Consulta de movimiento
      await this.page.evaluate(() => {
        const menuOption000000200A = document.querySelector<HTMLElement>(
          '#kyop-otherlevel-0 > div > div > ul > li > a'
        );

        if (menuOption000000200A == null) {
          throw new Error('Item <Movimientos del dia> del menu no encontrado.');
        }

        menuOption000000200A.click();
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const elementHandleFrame = await this.page.waitForSelector(
        '#kyop-central-load-area'
      );
      if (!elementHandleFrame) throw new Error('FRAME NO CARGADO');

      const frame = await elementHandleFrame.contentFrame();
      if (!frame) throw new Error('Error al buscar el frame');

      await frame.evaluate(() => {
        const checkPeriod = document.querySelector<HTMLElement>('#radio1');

        if (checkPeriod == null) {
          throw new Error('Check Periodo no encontrado.');
        }

        checkPeriod.click();
      });

      const todayDate = moment();

      await frame.evaluate(
        (dd, mm, yyyy) => {
          const initDay = document.querySelector<HTMLInputElement>(
            'body > div.form_container > div > form > div.section_container > div.section > table > tbody > tr:nth-child(5) > td:nth-child(2) > label > div:nth-child(2) > input:nth-child(1)'
          );
          if (initDay == null) {
            throw new Error('Check Periodo no encontrado.');
          }
          initDay.value = dd;

          const initMonth = document.querySelector<HTMLInputElement>(
            'body > div.form_container > div > form > div.section_container > div.section > table > tbody > tr:nth-child(5) > td:nth-child(2) > label > div:nth-child(2) > input:nth-child(3)'
          );
          if (initMonth == null) {
            throw new Error('Check Periodo no encontrado.');
          }
          initMonth.value = mm;

          const initYear = document.querySelector<HTMLInputElement>(
            'body > div.form_container > div > form > div.section_container > div.section > table > tbody > tr:nth-child(5) > td:nth-child(2) > label > div:nth-child(2) > input.in.fecha4'
          );
          if (initYear == null) {
            throw new Error('Check Periodo no encontrado.');
          }
          initYear.value = yyyy;

          const endDay = document.querySelector<HTMLInputElement>('#DiaHasta');
          if (endDay == null) {
            throw new Error('Check Periodo no encontrado.');
          }
          endDay.value = dd;

          const endMonth =
            document.querySelector<HTMLInputElement>('#MesHasta');
          if (endMonth == null) {
            throw new Error('Check Periodo no encontrado.');
          }
          endMonth.value = mm;

          const endYear =
            document.querySelector<HTMLInputElement>('#AnioHasta');
          if (endYear == null) {
            throw new Error('Check Periodo no encontrado.');
          }
          endYear.value = yyyy;
        },
        todayDate.format('DD'),
        todayDate.format('MM'),
        todayDate.format('YYYY')
      );

      logger.info(`Periodo ${todayDate.format('DD-MM-YYYY')} ingresado...`);

      // CLIC BOTON CONSULTAR
      await frame.evaluate(() => {
        const menuOption000000200A = document.querySelector<HTMLButtonElement>(
          'body > div.form_container > div > form > div.formActionButtons > div > input:nth-child(2)'
        );

        if (menuOption000000200A == null) {
          throw new Error('Boton CONSULTAR no encontrado.');
        }

        menuOption000000200A.click();
      });

      //www.bbvanetcash.pe/SPECNET/cent6_pe_web/ci00_excel.jsp
      // await this.page.waitForTimeout(5000);
      await frame.waitForSelector('body > table.tb_data', {
        visible: true
      });

      const textTable = await frame.evaluate(() => {
        const tableContent = document.querySelector<HTMLTableElement>(
          'body > table.tb_data'
        );
        if (tableContent == null) {
          throw new Error('No se encontro la tabla');
        }

        return tableContent.outerHTML;
      });

      logger.info('Tabla extraida...');

      const cheerio_load_b = cheerio.load(textTable);
      const jsonDataToday: any = [];

      cheerio_load_b('tr').each((index, element) => {
        const row = {};
        cheerio_load(element)
          .find('td')
          .each((index, element) => {
            const columnName = `column${index + 1}`;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            row[columnName] = cheerio_load(element).text().trim();
          });

        jsonDataToday.push(row);
      });

      jsonDataToday.splice(0, 3);

      jsonDataToday.forEach((row: any) => {
        DATA.push({
          fecha_operacion: moment(row['column1'], 'DD/MM/YYYY').format(
            'DD-MM-YYYY'
          ),
          fecha_valor: moment(row['column1'], 'DD/MM/YYYY').format(
            'DD-MM-YYYY'
          ),
          concepto: row['column2'],
          // importe: row['column3'],
          cargo:
            this.formatNumber(row['column3']) < 0
              ? Math.abs(this.formatNumber(row['column3']))
              : 0,
          abono:
            this.formatNumber(row['column3']) > 0
              ? this.formatNumber(row['column3'])
              : 0
        });

        if (this.formatNumber(row['column4']) > 0) {
          DATA.push({
            fecha_operacion: moment(row['column1'], 'DD/MM/YYYY').format(
              'DD-MM-YYY'
            ),
            fecha_valor: moment(row['column1'], 'DD/MM/YYYY').format(
              'DD-MM-YYY'
            ),
            concepto: 'ITF',
            // importe: row['column4'],
            cargo:
              this.formatNumber(row['column4']) < 0
                ? Math.abs(this.formatNumber(row['column4']))
                : 0,
            abono: 0
          });
        }
      });
    }

    // logger.info(DATA);
    return DATA;
  }
}

export default viewBalance;
