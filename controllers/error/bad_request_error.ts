import CustomServerError from './custom_server_error';

/**
 * BadRequest(400) 오류를 나타내는 클래스
 */
export default class BadReqError extends CustomServerError {
  constructor(message: string) {
    super({ statusCode: 400, message });
  }
}
