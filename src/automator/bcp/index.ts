import * as puppeteer from 'puppeteer';
import logger from '../../utils/logger';
import config from '../../config';
import Login from './login';
import ViewBalance from './viewBalance';
import goHome from './goHome';
import TransactionPeriod from './transactionPeriod';
import AutomatorError from '../automatorError';
import {
  getPageInstance,
  setPageInstance,
  closePageInstance
} from '../browserGlobal';

const errorMsgGeneralAutomator = 'Ocurrio un error en el proceso automatizado';

class BCP {
  private readonly page: puppeteer.Page;
  private readonly data: any;

  constructor(page: puppeteer.Page, data: any) {
    this.page = page;
    this.data = data;
  }

  async handleLogin(): Promise<any> {
    try {
      const login = new Login(this.page, this.data);
      await login.execute();
      logger.info('Almacenando instancia de la pagina...');
      const cachePage = await setPageInstance(this.page);
      return {
        transactionId: cachePage.id
      };
    } catch (error) {
      this.page.browser().close();
      if (error instanceof AutomatorError) {
        throw new Error(error.message);
      }
      logger.error(error);
      throw new Error(errorMsgGeneralAutomator);
    }
  }

  async handleLogout(): Promise<any> {
    try {
      await closePageInstance(this.data.transactionId);
      return {
        success: true
      };
    } catch (error) {
      if (error instanceof AutomatorError) {
        throw new Error(error.message);
      }
      logger.error(error);
      throw new Error(errorMsgGeneralAutomator);
    }
  }

  async handleViewBalance(): Promise<any> {
    try {
      await goHome(this.page);
      const viewBalance = new ViewBalance(this.page, this.data);
      const result = await viewBalance.execute();

      return result;
    } catch (error) {
      if (error instanceof AutomatorError) {
        throw new Error(error.message);
      }
      logger.error(error);
      throw new Error(errorMsgGeneralAutomator);
    }
  }

  async handleTransactionPeriod(): Promise<any> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }
    try {
      await goHome(this.page);
      const transactionPeriod = new TransactionPeriod(this.page, this.data);
      const result = await transactionPeriod.execute();

      return result;
    } catch (error) {
      if (error instanceof AutomatorError) {
        throw new Error(error.message);
      }
      logger.error(error);
      throw new Error(errorMsgGeneralAutomator);
    }
  }
}

const bcp = {
  async start(data: any) {
    let page: any;
    try {
      if (data.transactionId) {
        page = await getPageInstance(data.transactionId);
        logger.info('Instance Page searched.');
      } else {
        const windowSize = {
          width: 1400,
          height: 1000
        };
        const browser = await puppeteer.launch({
          args: [
            '--no-sandbox',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            `--window-size=${windowSize.width},${windowSize.height}`
          ],
          headless: config.server.isProduction ? true : false,
          defaultViewport: null
        });

        logger.info('Bot running');
        page = await browser.newPage();
        await page.goto(String(config.portal_bank.bcp_url));
      }
    } catch (error) {
      if (page) {
        const browser = page.browser();
        await page.close();
        await browser.close();
      }

      if (error instanceof AutomatorError) {
        throw new Error(error.message);
      }
      logger.error(error);
      throw new Error(errorMsgGeneralAutomator);
    }

    return new BCP(page, data);
  }
};

export default bcp;
