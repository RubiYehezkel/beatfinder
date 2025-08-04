import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { guestsGuard } from './guests.guard';

describe('guestsGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => guestsGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
