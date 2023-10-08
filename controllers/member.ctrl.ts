import { NextApiRequest, NextApiResponse } from 'next';
import MemberModel from '@/models/member/member.model';
import BadReqError from './error/bad_request_error';

/**
 * Firestore DB에 새 사용자를 등록하기 위한 API Handler
 *
 * @param {NextApiRequest} req - 들어온 요청 개채
 * @param {NextApiResponse} res - 나가는 응답 객체
 */
async function add(req: NextApiRequest, res: NextApiResponse) {
  const { uid, email, displayName, photoURL } = req.body;

  // uid 또는 email이 누락된 경우 400 에러 반환
  if (!uid || !email) {
    throw new BadReqError('uid 또는 email이 누락되었습니다.');
  }

  // MemberModel의 add 함수를 사용하여 사용자 추가
  const addResult = await MemberModel.add({ uid, email, displayName, photoURL });

  // 추가 결과에 따라 적절한 응답 반환
  if (addResult.result === true) {
    return res.status(200).json(addResult);
  }
  return res.status(500).json(addResult);
}

async function findByScreenName(req: NextApiRequest, res: NextApiResponse) {
  const { screenName } = req.query;
  if (screenName === undefined || screenName === null) {
    throw new BadReqError('screenName이 누락되었습니다.');
  }

  const extractScreenName = Array.isArray(screenName) ? screenName[0] : screenName;
  const findResult = await MemberModel.findByScreenName(extractScreenName);
  if (findResult === null) {
    return res.status(400).end();
  }
  res.status(200).json(findResult);
}

const MemberCtrl = {
  add,
  findByScreenName,
};

export default MemberCtrl;
