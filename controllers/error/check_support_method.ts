import BadReqError from './bad_request_error';

/**
 * 주어진 HTTP 메서드가 지원되는지 확인하는 함수
 *
 * @param {string[]} supportMethod - 지원되는 HTTP 메서드의 배열
 * @param {string} method - 확인할 HTTP 메서드
 * @throws {BadReqError} - 지원하지 않는 메서드일 경우 발생하는 BadRequest 오류
 */
export default function checkSupportMethod(supportMethod: string[], method?: string) {
  if (supportMethod.indexOf(method!) === -1) {
    throw new BadReqError('지원하지 않는 method 입니다.');
  }
}
