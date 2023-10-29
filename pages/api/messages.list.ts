import { NextApiRequest, NextApiResponse } from 'next';
import handleError from '@/controllers/error/handle_error';
import checkSupportMethod from '@/controllers/error/check_support_method';
import MessageCtrl from '@/controllers/message.ctrl';

/**
 * API Handler : Firestore DB에서 메시지 목록 가져오기
 *
 * @param {NextApiRequest} req - 들어온 요청 개채
 * @param {NextApiResponse} res - 나가는 응답 객체
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const supportMethod = ['GET'];

  try {
    checkSupportMethod(supportMethod, method);
    await MessageCtrl.list(req, res);
  } catch (err) {
    console.error(err);
    // 에러 처리
    handleError(err, res);
  }
}
