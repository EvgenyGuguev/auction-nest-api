import { zonedTimeToUtc } from 'date-fns-tz';

export const currentTime = zonedTimeToUtc(new Date(), 'UTC');
