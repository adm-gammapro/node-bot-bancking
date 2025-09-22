import { Page } from 'puppeteer';
import cheerio from 'cheerio';

import logger from '../../utils/logger';
import AutomatorError from '../automatorError';

class viewBalance {
  private readonly page: Page;
  private readonly data: any;

  constructor(page: Page, data: any) {
    this.page = page;
    this.data = data;
  }

  stringToFloat(value: string) {
    const floatValue = parseFloat(value.replace(/,/g, ''));
    return isNaN(floatValue) ? 0 : floatValue;
  }

  public async execute(): Promise<any> {
    const account_bank = this.data.cuentaBancaria;

    if (!this.page) {
      throw new Error('Page not initialized. Call initialize() first.');
    }

    logger.info('Navigating in the menu to the view...');

    // Dirigirse a la vista en el menu
    // document.querySelector("#kyop-opcionMenuHija_m_000000210D-menuLeft")
    await this.page.evaluate(() => {
      const menuOption000000200A = document.querySelector<HTMLElement>(
        '#kyop-menuOption-000000200A-menuLeft'
      );

      if (menuOption000000200A == null) {
        throw new Error(
          'Item <INFORMACIÓN DE CUENTAS> del menu no encontrado.'
        );
      }

      menuOption000000200A.click();

      const opcionMenuHijam000000323E = document.querySelector<HTMLElement>(
        '#kyop-opcionMenuHija_m_000000323E-menuLeft'
      );

      if (opcionMenuHijam000000323E == null) {
        throw new Error('Item <Saldos Contables> del menu no encontrado.');
      }

      opcionMenuHijam000000323E.click();
    });

    // TEST
    await this.page.waitForTimeout(4000);
    // END TEST

    //Click al hipervinculo Posición Global en linea
    await this.page.evaluate(() => {
      const menuOption000000200A = document.querySelector<HTMLElement>(
        '#kyop-opcionMenuHija_m_000000210D-menuLeft'
      );

      if (menuOption000000200A == null) {
        throw new Error(
          'Item <Posición Global en linea> en la vista no encontrado.'
        );
      }

      menuOption000000200A.click();
    });

    // TEST
    await this.page.waitForTimeout(4000);
    // END TEST

    // navegando en la vista
    const elementHandleFrame = await this.page.waitForSelector(
      '#kyop-central-load-area'
    );
    if (!elementHandleFrame) throw new Error('FRAME NO CARGADO');

    const frame = await elementHandleFrame.contentFrame();
    if (!frame) throw new Error('Error al buscar el frame');

    await this.page.waitForTimeout(2000);

    // TEST
    await this.page.waitForTimeout(4000);
    // END TEST

    await this.page.waitForFunction(() => {
      const componente = document.querySelector('#ventanaCapaEspera');
      return componente && getComputedStyle(componente).display === 'none';
    });

    // TEST
    await this.page.waitForTimeout(4000);
    // END TEST

    logger.info('Accediendo a vista de la cuenta');

    const textTable = await frame.evaluate(() => {
      const tableContent = document.querySelector<HTMLTableElement>(
        '#tabla-contenedor0_1'
      );
      if (tableContent == null) {
        throw new Error('No se encontro la tabla');
      }

      return tableContent.outerHTML;
    });

    // TEST
    await this.page.waitForTimeout(4000);
    // END TEST

    logger.info('Tabla extraida...');

    const cheerio_load = cheerio.load(textTable);
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

    logger.info('Datos extraidos.');

    const dataAccount = jsonData.find((element: any) => {
      return element['column1'].replace(/-/g, '') == account_bank;
    });

    console.log('dataAccount: ', dataAccount);

    if (!dataAccount) {
      throw new AutomatorError(`Cuenta ${account_bank} no encontrada.`);
    }

    const resultData: object = {
      saldo_contable: this.stringToFloat(dataAccount['column3']),
      saldo_disponible: this.stringToFloat(dataAccount['column4'])
    };
    // TEST
    await this.page.waitForTimeout(4000);
    // END TEST
    
    // await this.page.waitForTimeout(3600000);
    return resultData;
  }
}
//
//PEN - 001104860100193411
//USD - 001104860100164047
export default viewBalance;
