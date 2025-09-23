import puppeteer, { Page } from 'puppeteer';

import logger from '../../utils/logger';
import AutomatorError from '../automatorError';

class Login {
  private readonly page: Page;
  private readonly data: any;

  constructor(page: Page, data: any) {
    this.page = page;
    this.data = data;
  }

  async _login() {
    if (!this.page) {
      throw new Error('Page not initialized. Call initialize() first.');
    }

    logger.info('Logging in...');

    // TEST
    await new Promise(resolve => setTimeout(resolve, 5000));
    // END TEST

    
    await this.page.waitForSelector('#empresa', {
      visible: true,
      timeout: 10000
    });

    // // TEST
    // await this.page.waitForTimeout(500000);
    // // END TEST
    

    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.page.type('#empresa', this.data.codigoEmpresa);
    await this.page.type('#usuario', this.data.codigoUsuario);

    await this.page.type('#clave_acceso_ux', this.data.claveAcceso);
    await new Promise(resolve => setTimeout(resolve, 1000));


    

    await this.page.click('#aceptar');
    logger.info('Logging submit...');
    await this.page.waitForNavigation();
    await this.page.waitForSelector('#kyop-contentholder', { hidden: true });
    const menuSearched = await this.page
      .waitForSelector('#kyop-menu', { timeout: 1000 })
      .then(() => true)
      .catch(() => false);

    logger.info('loading terminado...');

    if (!menuSearched) {
      /**
       * Se valida si existe un mensaje de error del inicio de session
       */
      try {
        await this.page.waitForSelector('body > form > div.info > h3', {
          timeout: 1000
        });
        const errorLogin = await this.page.evaluate(() => {
          const titleError = document.querySelector<HTMLElement>(
            'body > form > div.info > h3'
          );
          if (titleError && titleError.innerHTML === 'Ingreso Incorrecto') {
            const msgError = document.querySelector<HTMLElement>(
              'body > form > div.info > table:nth-child(2) > tbody > tr > td:nth-child(2)'
            );
            if (msgError && msgError.innerText) {
              return msgError.innerText;
            }
          }
          throw new Error('Ocurrio un error al inciar session');
        });
        throw new AutomatorError(errorLogin);
      } catch (error) {
        logger.error(error);
        logger.info('Capturando SCREEN DEL ERROR...');
        const base64 = await this.page.screenshot({ encoding: 'base64' });
        logger.info(base64);
        if (error instanceof Error) {
          // Verificar si es error de timeout por el mensaje
          const isTimeoutError = error.message.includes('timeout') || 
                                error.message.includes('Timeout') ||
                                error.name === 'TimeoutError';
          
          if (!isTimeoutError) {
            throw error;
          }
          // Si es timeout, no hacer throw (dejar continuar o manejar según necesidad)
          logger.info('Timeout esperando selector, continuando...');
        } else {
          throw error;
        }
      }
      /**
       * En el caso el login retorne nuevamente al formulario de inicio de session
       */
      try {
        await this.page.waitForSelector(
          'body > div > div:nth-child(2) > div.col-lg-12 > div > div > div:nth-child(5) > form:nth-child(2)',
          { visible: true, timeout: 5000 }
        );
        logger.error('RETORNOR AL LOGIN');
        await this._login();
      } catch (error) {
        logger.info('Login successful.');
      }
    }
  }

  async _popupNotification(): Promise<void> {
    if (!this.page) {
      throw new Error('Page not initialized. Call initialize() first.');
    }

    logger.info('Scan Popuop Notification...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // #kyop-lightbox-internal-container-div

    try {
      const elementHandleFrame = await this.page.waitForSelector(
        '#kyop-lightbox-iframe-div',
        { visible: true, timeout: 5000 }
      );
      if (!elementHandleFrame) return;

      const frame = await elementHandleFrame.contentFrame();
      if (!frame) return;
      await frame.waitForSelector('#close');
      await frame.click('#close');
    } catch (error) {
      logger.warn('Modal inicial no encontrado.');
    }

    //TODO: validar si existe o no
    try {
      await this.page.click(
        '#custom-modal-campaing > div.kyop-messagebox-container-div > div > div.right'
      );
    } catch (error) {
      logger.warn('Modal campaña no encontrado.');
    }

    logger.info('Scan Popuop Notification successful');
  }

  public async execute(): Promise<any> {
    await this._login();
    await this._popupNotification();
  }
}

export default Login;
