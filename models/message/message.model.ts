import { firestore } from 'firebase-admin';
import CustomServerError from '@/controllers/error/custom_server_error';
import FirebaseAdmin from '../firebase_admin';
import { InMessage, InMessageServer } from './in_message';
import { InAuthUser } from '../in_auth_user';

// Firestore 컬렉션 명칭
const MEMBER_COL = 'members';
const MSG_COL = 'messages';
const SCR_NAME_COL = 'screen_names';

// FirebaseAdmin에서 Firestore 객체 가져오기
const { Firestore } = FirebaseAdmin.getInstance();

/**
 * 사용자가 작성한 메시지를 Firestore에 등록하는 함수
 *
 * @param {Object} param0 - 메시지 정보와 작성자 정보
 * @param {string} param0.uid - 사용자 고유 식별자
 * @param {string} param0.message - 작성한 메시지
 * @param {Object} param0.author - 작성자 정보 (옵션)
 */
async function post({
  uid,
  message,
  author,
}: {
  uid: string;
  message: string;
  author?: {
    displayName: string;
    photoURL?: string;
  };
}) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);

  await Firestore.runTransaction(async (transaction) => {
    let messageCount = 1;

    // 사용자 정보를 트랜잭션에서 가져오기
    const memberDoc = await transaction.get(memberRef);
    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자입니다.' });
    }

    // 사용자의 메시지 카운트 정보 가져오기
    const memberInfo = memberDoc.data() as InAuthUser & { messageCount?: number };
    if (memberInfo.messageCount !== undefined) {
      messageCount = memberInfo.messageCount;
    }

    // 새로운 메시지를 위한 레퍼런스 생성
    const newMessageRef = memberRef.collection(MSG_COL).doc();
    // 새로운 메시지 데이터
    const newMessageBody: {
      message: string;
      createAt: firestore.FieldValue;
      author?: {
        displayName: string;
        photoURL?: string;
      };
      messageNo: number;
    } = {
      message,
      messageNo: messageCount,
      createAt: firestore.FieldValue.serverTimestamp(),
    };
    if (author !== undefined) {
      newMessageBody.author = author;
    }

    // 트랜잭션을 사용하여 새로운 메시지와 메시지 카운트 업데이트
    await transaction.set(newMessageRef, newMessageBody);
    await transaction.update(memberRef, { messageCount: messageCount + 1 });
  });
}

/**
 * 메시지 업데이트(차단/차단 해제)를 위한 비동기 함수
 *
 * @param {string} uid - 사용자 식별자
 * @param {string} messageId - 메시지 식별자
 * @param {boolean} deny - 거부 여부
 * @returns {Promise<InMessageServer>} - 업데이트된 메시지 데이터
 * @throws {CustomServerError} - 커스텀 서버 에러 (사용자 또는 게시글이 존재하지 않을 경우)
 */
async function updateMessage({ uid, messageId, deny }: { uid: string; messageId: string; deny: boolean }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = Firestore.collection(MEMBER_COL).doc(uid).collection(MSG_COL).doc(messageId);

  const result = await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    const messageDoc = await transaction.get(messageRef);
    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자입니다.' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 게시글' });
    }

    // 메시지 문서 업데이트
    await transaction.update(messageRef, { deny });

    // 업데이트된 메시지 데이터 매핑
    const messageData = messageDoc.data() as InMessageServer;

    // 데이터 매핑 및 반환
    return {
      ...messageData,
      id: messageId,
      deny,
      createAt: messageData.createAt.toDate().toISOString(),
      replyAt: messageData.replyAt ? messageData.replyAt.toDate().toISOString() : undefined,
    };
  });
  return result;
}

/**
 * 사용자가 작성한 메시지 목록을 가져오는 함수
 *
 * @param {Object} param0 - 사용자 고유 식별자
 * @param {string} param0.uid - 사용자 고유 식별자
 * @returns {Promise<InMessage[]>} - 사용자가 작성한 메시지 목록
 */
async function list({ uid }: { uid: string }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);

  const listData = await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자입니다.' });
    }

    // 사용자의 메시지 컬렉션을 최신순 가져오기
    const messageCol = memberRef.collection(MSG_COL).orderBy('createAt', 'desc');
    const messageColDoc = await transaction.get(messageCol);

    // 데이터 매핑 및 반환
    const data = messageColDoc.docs.map((mv) => {
      const docData = mv.data() as Omit<InMessageServer, 'id'>;
      const returnData = {
        ...docData,
        id: mv.id,
        createAt: docData.createAt.toDate().toISOString(),
        replyAt: docData.replyAt ? docData.replyAt.toDate().toISOString() : undefined,
      } as InMessage;
      return returnData;
    });

    return data;
  });
  return listData;
}

/**
 * 사용자가 작성한 메시지 목록을 페이지별로 가져오는 함수
 *
 * @param {Object} param0 - 사용자 고유 식별자, 페이지, 페이지 크기
 * @param {string} param0.uid - 사용자 고유 식별자
 * @param {number} param0.page - 페이지 번호 (기본값: 1)
 * @param {number} param0.size - 페이지 크기 (기본값: 10)
 * @returns {Promise<{ totalElements: number, totalPages: number, page: number, size: number, content: InMessage[] }>} - 페이지별 메시지 목록
 */
async function listWithPage({ uid, page = 1, size = 10 }: { uid: string; page?: number; size?: number }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);

  const listData = await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자입니다.' });
    }

    const memberInfo = memberDoc.data() as InAuthUser & { messageCount?: number };
    const { messageCount = 0 } = memberInfo;

    const totalElements = messageCount !== 0 ? messageCount - 1 : 0;
    const remains = totalElements % size;
    const totalPages = (totalElements - remains) / size + (remains > 0 ? 1 : 0);
    const startAt = totalElements - (page - 1) * size;

    // 페이지에 해당하는 메시지 가져오기
    if (startAt < 0) {
      return {
        totalElements,
        totalPages: 0,
        page,
        size,
        content: [],
      };
    }

    const messageCol = memberRef.collection(MSG_COL).orderBy('messageNo', 'desc').startAt(startAt).limit(size);
    const messageColDoc = await transaction.get(messageCol);

    // 데이터 매핑 및 반환
    const data = messageColDoc.docs.map((mv) => {
      const docData = mv.data() as Omit<InMessageServer, 'id'>;
      const isDeny = docData.deny !== undefined && docData.deny === true;
      const returnData = {
        ...docData,
        id: mv.id,
        message: isDeny ? '비공개 처리된 메시지 입니다.' : docData.message,
        createAt: docData.createAt.toDate().toISOString(),
        replyAt: docData.replyAt ? docData.replyAt.toDate().toISOString() : undefined,
      } as InMessage;
      return returnData;
    });
    return {
      totalElements,
      totalPages,
      page,
      size,
      content: data,
    };
  });
  return listData;
}

/**
 * 사용자가 작성한 특정 메시지를 가져오는 함수
 *
 * @param {Object} param0 - 사용자 고유 식별자, 메시지 고유 식별자
 * @param {string} param0.uid - 사용자 고유 식별자
 * @param {string} param0.messageId - 메시지 고유 식별자
 * @returns {Promise<InMessage>} - 특정 메시지 정보
 */
async function get({ uid, messageId }: { uid: string; messageId: string }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = Firestore.collection(MEMBER_COL).doc(uid).collection(MSG_COL).doc(messageId);

  const data = await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    const messageDoc = await transaction.get(messageRef);
    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 게시글' });
    }

    const messageData = messageDoc.data() as InMessageServer;
    const isDeny = messageData.deny !== undefined && messageData.deny === true;
    // 데이터 매핑 및 반환
    return {
      ...messageData,
      message: isDeny ? '비공개 처리된 메시지 입니다.' : messageData.message,
      id: messageId,
      createAt: messageData.createAt.toDate().toISOString(),
      replyAt: messageData.replyAt ? messageData.replyAt.toDate().toISOString() : undefined,
    };
  });
  return data;
}

/**
 * 사용자가 작성한 메시지에 댓글을 등록하는 함수
 *
 * @param {Object} param0 - 사용자 고유 식별자, 메시지 고유 식별자, 댓글 내용
 * @param {string} param0.uid - 사용자 고유 식별자
 * @param {string} param0.messageId - 메시지 고유 식별자
 * @param {string} param0.reply - 댓글 내용
 */
async function postReply({ uid, messageId, reply }: { uid: string; messageId: string; reply: string }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = Firestore.collection(MEMBER_COL).doc(uid).collection(MSG_COL).doc(messageId);

  await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    const messageDoc = await transaction.get(messageRef);
    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 게시글' });
    }

    const messageData = messageDoc.data() as InMessageServer;
    if (messageData.reply !== undefined) {
      throw new CustomServerError({ statusCode: 400, message: '댓글을 등록 중입니다.' });
    }

    // 댓글 등록
    await transaction.update(messageRef, { reply, replyAt: firestore.FieldValue.serverTimestamp() });
  });
}

const MessageModel = {
  post,
  updateMessage,
  list,
  listWithPage,
  get,
  postReply,
};

export default MessageModel;
