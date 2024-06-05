import path from 'path';
import * as fs from 'fs';

describe('AddNewDbModal import modal', () => {
  describe('Find special keywords from import file', () => {
    it('should be a .sql file', () => {
      const filePath = path.join(__dirname, '../../mockDBFiles/starwarspg.sql');
      expect(filePath.endsWith('sql')).toBe(true);
    });

    it('should check if .sql file DOES contain keywords', () => {
      // starwars does contain the keyword
      const filePath = path.join(
        __dirname,
        '../../../frontend/components/views/DbView/sample-updateschema.js',
      );

      // Read the file content
      //   const fileContent = fs.readFileSync(filePath, 'utf8');

      //   const keywordRegex = /(CREATE|DATABASE)/gi;

      //   const containsKeywords = keywordRegex.test(fileContent);

      //   expect(containsKeywords).toBe(true);

      // reads the mock database
      const data =
        fs
          .readFileSync(filePath, 'utf-8')
          .replace(/`([^`]+)`|\b([a-zA-Z_]+)\b/g, '$1$2')
          .replace(/;/g, '')
          .match(/\S+/g) || [];

      // iterate through data and check if it contains the following keywords
      const containsKeywords = data.some((word) =>
        ['CREATE', 'DATABASE'].includes(word.toUpperCase()),
      );

      if (containsKeywords) {
        // iternate thorugh data to check if create & database is next to each other
        for (let i = 0; i < data.length; i += 1) {
          // if truthy, database file does contain the keywords
          if (data[i] === 'CREATE' && data[i + 1] === 'DATABASE') {
            expect(containsKeywords).toBe(true);
          }
        }
      }
    });

    it('should check if .sql file DOES NOT contain keywords', () => {
      // dellstore does not contain the keyword
      const filePath = path.join(
        __dirname,
        '../../../frontend/components/views/DbView/sample-updateschema.js',
      );

      const data =
        fs
          .readFileSync(filePath, 'utf-8')
          .replace(/`([^`]+)`|\b([a-zA-Z_]+)\b/g, '$1$2')
          .replace(/;/g, '')
          .match(/\S+/g) || [];
      // iterate through data and check if it contains the following keywords
      const containsKeywords = data.some((word) =>
        ['CREATE', 'DATABASE', 'USE'].includes(word.toUpperCase()),
      );

      if (containsKeywords) {
        // iternate thorugh data to check if create & database is next to each other
        for (let i = 0; i < data.length; i += 1) {
          // if falsey, database file does not contain the keywords
          if (data[i] === 'CREATE' && data[i + 1] === 'DATABASE') {
            expect(containsKeywords).toBe(false);
          }
        }
      }
    });
  });
});
