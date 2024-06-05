
import * as consoleModule from 'console';
import { LogType } from '../../../../../shared/types/types';

import logger from '../../../../../backend/src/utils/logging/masterlog';



describe('Logger Functionality', () => {

  it('should log normal messages with white color', () => {
    const spy = jest.spyOn(consoleModule.Console.prototype, 'log');
    logger('This is a normal log message');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[NORMAL] This is a normal log message'));
  });

  it('should log error messages with red color', () => {
    const spy = jest.spyOn(consoleModule.Console.prototype, 'log');
    logger('An error occurred', undefined, undefined, LogType.ERROR);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[ERROR] An error occurred'));
  });

  it('should handle optional parameters', () => {
    const spy = jest.spyOn(consoleModule.Console.prototype, 'log');
    logger('A log with options', { key: 'value' }, ['item1', 'item2']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[NORMAL] A log with options{"key":"value"}["item1","item2"]'));
  });
});