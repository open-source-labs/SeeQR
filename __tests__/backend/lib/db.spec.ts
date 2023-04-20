// Here we will be unit testing the 3 main database functions from server/db/markets.js
const fs = require("fs");
const path = require("path");
// import channels to invoke icphandle()

describe("db unit tests", () => {
    afterAll((done) => {
    // delete table and data
  });

  describe("#query", () => {
    it("executes a query to the selected DB", () => {
      // test
    });

    it("returns an error when query is wrong", () => {
      // 
      expect(typeError).toBeInstanceOf(TypeError);
    });

    it("returns an error when cards value is not a number", () => {
      const marketList1 = [{ location: "string", cards: "1" }];
      const typeError = db.sync(marketList1);
      expect(typeError).toBeInstanceOf(TypeError);
    });
  });

});
