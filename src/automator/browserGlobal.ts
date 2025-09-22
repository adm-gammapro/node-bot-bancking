import { Page } from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';
import AutomatorError from './automatorError';
import logger from '../utils/logger';
import moment from 'moment';

const formatDate = 'YYYY-MM-DD HH:mm:ss';
interface CachedPage {
  id: string;
  page: Page;
  createdAt: number;
  lastAccessDate: string;
}

const cachedPages: CachedPage[] = [];

export async function getPageInstance(id: string): Promise<Page> {
  if (id) {
    const cachedPage = cachedPages.find((p) => p.id === id);
    if (cachedPage) {
      cachedPage.lastAccessDate = moment().format(formatDate);
      return cachedPage.page;
    }
  }
  throw new AutomatorError('No existe el proceso en memoria.');
}

export async function closePageInstance(id: string): Promise<void> {
  const index = cachedPages.findIndex((p) => p.id === id);

  if (index !== -1) {
    const closedPage = cachedPages[index].page;
    const closedBrowser = closedPage.browser();
    if (closedBrowser) {
      await closedBrowser.close();
    }
    cachedPages.splice(index, 1);
  }
}

export async function setPageInstance(page: Page): Promise<any> {
  const newId = uuidv4();
  const dataPage = {
    id: newId,
    page,
    createdAt: Date.now(),
    lastAccessDate: moment().format(formatDate)
  };
  cachedPages.push(dataPage);
  return dataPage;
}

export function init() {
  // logger.info(`Sessiones actuales: ${cachedPages.length}`);

  cachedPages.forEach((page) => {
    const dateLastAccess = moment(page.lastAccessDate, formatDate);
    if (moment() > dateLastAccess.add(10, 'minutes')) {
      logger.warn(
        `Ultimo uso fue a las ${dateLastAccess.format(
          formatDate
        )}, se cerrara el navegador`
      );

      closePageInstance(page.id);
    }
  });

  setTimeout(() => {
    init();
  }, 30000);
}
