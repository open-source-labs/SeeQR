
import generateDummyData, { getRandomInt }  from '../../../../../backend/src/utils/dummyData/dummyDataMain';
import { ColumnObj } from '../../../../../shared/types/types'; 

describe('Dummy Data Generator', () => {
  describe('getRandomInt', () => {
    it('should generate a random integer within the specified range', () => {
      const min = 10;
      const max = 20;
      const result = getRandomInt(min, max);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    });
  });

  describe('generateDummyData', () => {
    it('should generate dummy data for a single row with mixed data types', async () => {
      const tableInfo: ColumnObj[] = [
        {
            column_name: 'id', data_type: 'integer',
            character_maximum_length: null,
            is_nullable: '',
            constraint_type: null,
            foreign_table: null,
            foreign_column: null
        },
        {
            column_name: 'name', data_type: 'character varying', character_maximum_length: 50,
            is_nullable: '',
            constraint_type: null,
            foreign_table: null,
            foreign_column: null
        },
        {
            column_name: 'is_active', data_type: 'boolean',
            character_maximum_length: null,
            is_nullable: '',
            constraint_type: null,
            foreign_table: null,
            foreign_column: null
        },
      ];
      const numRows = 1;
      const dummyRecords = await generateDummyData(tableInfo, numRows);

      expect(dummyRecords).toHaveLength(numRows + 1); // +1 for header row
      expect(dummyRecords[1]).toEqual([
        expect.any(Number), // Integer
        expect.stringMatching(/'.+'/), // Character varying
        expect.stringMatching(/'true'|'false'/), // Boolean
      ]);
    });

    // Add more tests
  });
});