import { NextApiResponse } from 'next';
import CustomServerError from './custom_server_error';

/**
 * 에러를 처리하고 응답하는 함수
 *
 * @param {unknown} err - 처리할 에러 객체
 * @param {NextApiResponse} res - Next.js의 응답 객체
 */
const handleError = (err: unknown, res: NextApiResponse) => {
  let unknownErr = err;
  if (err instanceof CustomServerError === false) {
    unknownErr = new CustomServerError({ statusCode: 499, message: 'Unknown Error' });
  }

  const customError = unknownErr as CustomServerError;

  res
    .status(customError.statusCode)
    .setHeader('location', customError.location ?? '') // 오류 발생 위치 헤더 설정
    .send(customError.serializeErrors()); // 에러 응답에 body를 전달
};

export default handleError;
