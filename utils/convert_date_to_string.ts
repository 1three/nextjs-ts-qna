import moment from 'moment';

/**
 * ISO 8601 형식의 날짜 문자열을 받아와, 현재 시간과의 차이를 문자열로 변환하는 함수
 *
 * @param {string} dateString - ISO 8601 형식의 날짜 문자열
 * @returns {string} - 현재 시간과의 차이를 나타내는 문자열
 */
function convertDateToString(dateString: string): string {
  const dateTime = moment(dateString, moment.ISO_8601).milliseconds(0);
  const now = moment();

  const diff = now.diff(dateTime);
  const calDuration = moment.duration(diff);

  const years = calDuration.years();
  const months = calDuration.months();
  const days = calDuration.days();
  const hours = calDuration.hours();
  const minutes = calDuration.minutes();
  const seconds = calDuration.seconds();

  if (
    years === 0 &&
    months === 0 &&
    days === 0 &&
    hours === 0 &&
    minutes === 0 &&
    seconds !== undefined &&
    (seconds === 0 || seconds < 1)
  ) {
    return '0초';
  }
  if (years === 0 && months === 0 && days === 0 && hours === 0 && minutes === 0 && seconds) {
    return `${Math.floor(seconds)}초`;
  }
  if (years === 0 && months === 0 && days === 0 && hours === 0 && minutes) {
    return `${minutes}분`;
  }
  if (years === 0 && months === 0 && days === 0 && hours) {
    return `${hours}시간`;
  }
  if (years === 0 && months === 0 && days) {
    return `${days}일`;
  }
  if (years === 0 && months) {
    return `${months}개월`;
  }
  return `${years}년`;
}

export default convertDateToString;
