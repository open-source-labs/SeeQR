global.TextEncoder = require('util').TextEncoder;

// jest.mock('../../../backend/src/models/connectionModel');
// jest.mock('../../../backend/src/models/queryModel');

import { runSelectAllQuery } from '../../../backend/src/ipcHandlers/handlers/queryHandler';
import connectionModel from '../../../backend/src/models/connectionModel';
import queryModel from '../../../backend/src/models/queryModel';

window.require = ((str: string) => str) as any;
// const mockConnectionModel = {
//   connectToDB: jest.fn().mockResolvedValue('pg'),
// };

// const mockQueryModel = {
//   query: jest.fn().mockResolvedValue([{ newcolumn1: 'hi' }]),
// };

jest.mock('../../../backend/src/models/connectionModel', () => ({
  __esModule: true,
  default: {
    connectToDB: jest.fn().mockResolvedValue('pg'), // Mock the connectToDB function
  },
}));

jest.mock('../../../backend/src/models/queryModel', () => ({
  __esModule: true,
  default: {
    query: jest.fn().mockResolvedValue({ rows: [{ newcolumn1: 'hi' }] }), // Mock the query function directly
  },
}));

// Typecast the modules to their mock counterparts
const mockConnectionModel = connectionModel as jest.Mocked<
  typeof connectionModel
>;
const mockQueryModel = queryModel as jest.Mocked<typeof queryModel>;
describe('runSelectAllQuery', () => {
  it('should run select all query and return results', async () => {
    const event = {};
    const sqlString = 'SELECT * FROM newtable1';
    const selectedDb = 'test';
    const curDBType = 'pg';
    const result = await runSelectAllQuery(
      event,
      { sqlString, selectedDb },
      curDBType,
    );


    expect(mockConnectionModel.connectToDB).toHaveBeenCalledWith('test', 'pg');
    expect(mockConnectionModel.connectToDB).toHaveBeenCalledTimes(1);
    expect(mockQueryModel.query).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ newcolumn1: 'hi' }]);
  });
});
