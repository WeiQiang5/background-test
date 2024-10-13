// eslint-disable-next-line @typescript-eslint/no-var-requires
const dayjs = require('dayjs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const utc = require('dayjs/plugin/utc');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

console.log(dayjs);

const formatDateTime = (value: Date, timezoneString: string): string => {
  if (!(value instanceof Date)) {
    throw new Error('Expected a Date object');
  }
  return dayjs.tz(value, timezoneString).format('YYYY-MM-DD HH:mm:ss');
};

export const dateTransformer = {
  from: (value: Date): string => {
    return formatDateTime(value, 'Asia/Shanghai');
  },
  to: (value: Date): string => {
    return formatDateTime(value, 'Asia/Shanghai');
  },
};
