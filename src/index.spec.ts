import { reactiveEnum } from './index';
import { combineLatest } from 'rxjs';

enum Status {
  Initial,
  Loading,
}

describe(`reactiveEnum`, () => {
  describe('given an enum', () => {
    it('should generate a set of methods based on the enum', () => {
      const status$ = reactiveEnum(Status);

      expect(status$.loading$).toBeDefined();
      expect(status$.initial$).toBeDefined();
    });

    it('should start with a default value', (done) => {
      const status$ = reactiveEnum(Status, {
        initialValue: Status.Initial,
      });

      combineLatest([
        status$.loading$,
        status$.initial$,
      ]).subscribe(([loading, initial]) => {
        expect(loading).toBe(false);
        expect(initial).toBe(true);

        done();
      });
    });
  });
});
