import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateExecutiveQuote,
  convertUsdToCurrency,
  formatCurrency,
  validateBookingForm,
} from './currency';

test('multi-currency conversion rounds cleanly per currency precision', () => {
  assert.equal(convertUsdToCurrency(100, 'USD'), 100);
  assert.equal(convertUsdToCurrency(100, 'EUR'), 92);
  assert.equal(convertUsdToCurrency(100, 'JPY'), 15400);
  assert.equal(formatCurrency(15400, 'JPY'), '¥15,400');
});

test('executive quote calculates airport, point-to-point, and hourly pricing accurately', () => {
  const vehicle = { baseFareUsd: 165, perMileUsd: 5.5, hourlyRateUsd: 145 };
  const airportQuote = calculateExecutiveQuote({
    vehicle,
    tripType: 'airport',
    distanceMiles: 20,
    hours: 3,
    currency: 'USD',
  });
  // Subtotal = 165 + 20 * 5.5 = 275; concierge = 22; tax = (275+22)*0.065 = 19.31; total = 316.31
  assert.equal(airportQuote.subtotalUsd, 275);
  assert.equal(airportQuote.conciergeFeeUsd, 22);
  assert.equal(airportQuote.taxUsd, 19.31);
  assert.equal(airportQuote.totalUsd, 316.31);

  const hourlyQuote = calculateExecutiveQuote({
    vehicle,
    tripType: 'hourly',
    distanceMiles: 10,
    hours: 4,
    currency: 'EUR',
  });
  assert.equal(hourlyQuote.subtotalUsd, 580);
  assert.equal(hourlyQuote.subtotalConverted, convertUsdToCurrency(580, 'EUR'));
});

test('booking form validation enforces required fields and passenger limits', () => {
  const invalid = validateBookingForm({
    pickup: 'A',
    dropoff: '',
    pickupDateTime: '',
    passengerName: 'J',
    corporateEmail: 'bad-email',
    passengers: 9,
    maxPassengers: 6,
  });
  assert.ok(invalid.pickup);
  assert.ok(invalid.dropoff);
  assert.ok(invalid.pickupDateTime);
  assert.ok(invalid.passengerName);
  assert.ok(invalid.corporateEmail);
  assert.ok(invalid.passengers);

  const valid = validateBookingForm({
    pickup: 'Denver International Airport (DEN)',
    dropoff: 'Four Seasons Denver',
    pickupDateTime: '2026-11-18T14:30',
    passengerName: 'Elena Rostova',
    corporateEmail: 'elena.rostova@zurichcapital.ch',
    passengers: 3,
    maxPassengers: 6,
  });
  assert.deepEqual(valid, {});
});
