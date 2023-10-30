import { NextApiRequest, NextApiResponse } from 'next';
import BadReqError from './error/bad_request_error';
import MessageModel from '@/models/message/message.model';
import CustomServerError from './error/custom_server_error';
import FirebaseAdmin from '@/models/firebase_admin';

/**
 * 새로운 메시지를 작성하는 API 핸들러
 *
 * @param {NextApiRequest} req - 들어온 요청 객체
 * @param {NextApiResponse} res - 나가는 응답 객체
 */
async function post(req: NextApiRequest, res: NextApiResponse) {
  const { uid, message, author } = req.body;

  // uid 또는 message가 누락된 경우 400 에러 반환
  if (uid === undefined) {
    throw new BadReqError('uid 누락');
  }
  if (message === undefined) {
    throw new BadReqError('message 누락');
  }

  // MessageModel의 post 함수를 사용하여 메시지 작성
  await MessageModel.post({ uid, message, author });

  // 메시지 작성 성공 시 201 Created 응답 반환
  return res.status(201).end();
}

/**
 * 특정 메시지를 거절하는 API 핸들러
 */
async function updateMessage(req: NextApiRequest, res: NextApiResponse) {
  // Authorization 헤더에서 토큰 추출
  const token = req.headers.authorization;
  if (token === undefined) {
    throw new CustomServerError({ statusCode: 401, message: '권한이 없습니다.' });
  }

  let tokenUid: null | string = null;
  try {
    // 토큰 디코딩 및 uid 추출
    const decode = await FirebaseAdmin.getInstance().Auth.verifyIdToken(token);
    tokenUid = decode.uid;
  } catch (err) {
    throw new BadReqError('Token에 문제가 있습니다.');
  }

  const { uid, messageId, deny } = req.body;
  if (uid === undefined) {
    throw new BadReqError('uid 누락');
  }
  if (uid !== tokenUid) {
    throw new CustomServerError({ statusCode: 401, message: '수정 권한이 없습니다.' });
  }
  if (messageId === undefined) {
    throw new BadReqError('messageId 누락');
  }
  if (deny === undefined) {
    throw new BadReqError('deny 누락');
  }

  // MessageModel의 updateMessage 함수를 사용하여 메시지 업데이트
  const result = await MessageModel.updateMessage({ uid, messageId, deny });

  // 수정 결과를 200 OK 응답으로 반환
  return res.status(200).json(result);
}

/**
 * 특정 사용자의 메시지 목록을 조회하는 API 핸들러
 */
async function list(req: NextApiRequest, res: NextApiResponse) {
  const { uid, page, size } = req.query;

  // uid가 누락된 경우 400 에러 반환
  if (uid === undefined) {
    throw new BadReqError('uid 누락');
  }

  // 페이지 및 사이즈 값이 없는 경우 기본값 설정
  const convertPage = page === undefined ? '1' : page;
  const convertSize = size === undefined ? '10' : size;

  // 배열 형태의 쿼리 파라미터를 문자열로 추출
  const uidToStr = Array.isArray(uid) ? uid[0] : uid;
  const pageToStr = Array.isArray(convertPage) ? convertPage[0] : convertPage;
  const sizeToStr = Array.isArray(convertSize) ? convertSize[0] : convertSize;

  // MessageModel의 listWithPage 함수를 사용하여 메시지 목록 조회
  const listResp = await MessageModel.listWithPage({
    uid: uidToStr,
    page: parseInt(pageToStr, 10),
    size: parseInt(sizeToStr, 10),
  });

  // 조회 결과를 200 OK 응답으로 반환
  return res.status(200).json(listResp);
}

/**
 * 특정 사용자의 특정 메시지를 조회하는 API 핸들러
 */
async function get(req: NextApiRequest, res: NextApiResponse) {
  const { uid, messageId } = req.query;

  // uid 또는 messageId가 누락된 경우 400 에러 반환
  if (uid === undefined) {
    throw new BadReqError('uid 누락');
  }
  if (messageId === undefined) {
    throw new BadReqError('messageId 누락');
  }

  // 배열 형태의 쿼리 파라미터를 문자열로 추출
  const uidToStr = Array.isArray(uid) ? uid[0] : uid;
  const messageIdToStr = Array.isArray(messageId) ? messageId[0] : messageId;

  // MessageModel의 get 함수를 사용하여 특정 메시지 조회
  const data = await MessageModel.get({ uid: uidToStr, messageId: messageIdToStr });

  // 조회 결과를 200 OK 응답으로 반환
  return res.status(200).json(data);
}

/**
 * 특정 메시지에 답글을 작성하는 API 핸들러
 */
async function postReply(req: NextApiRequest, res: NextApiResponse) {
  const { uid, messageId, reply } = req.body;

  // uid, messageId, reply가 누락된 경우 400 에러 반환
  if (uid === undefined) {
    throw new BadReqError('uid 누락');
  }
  if (messageId === undefined) {
    throw new BadReqError('messageId 누락');
  }
  if (reply === undefined) {
    throw new BadReqError('reply 누락');
  }

  // MessageModel의 postReply 함수를 사용하여 답글 작성
  await MessageModel.postReply({ uid, messageId, reply });

  // 작성 성공 시 201 Created 응답 반환
  return res.status(201).end();
}

// MessageCtrl 객체에 API Handler 함수들을 담은 객체
const MessageCtrl = {
  post,
  updateMessage,
  list,
  get,
  postReply,
};

export default MessageCtrl;
