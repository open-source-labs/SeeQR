import { getRandomInt } from '../../../backend/src/utils/dummyData/dummyDataMain';

describe('dummyData generated', () => {
  it('should return a integer that lands between -Inf and Inf', () => {
    const result = getRandomInt(-100, 100);
    expect(typeof getRandomInt(-100, 100) === 'number').toEqual(true);
    expect(result >= -100).toBeTruthy();
    expect(result < 100).toBeTruthy();
  });
});
