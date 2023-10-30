import { firestore } from 'firebase-admin';

/**
 * Firestore에 저장되는 메시지의 기본 속성을 정의한 인터페이스
 */
interface MessageBase {
  id: string;
  message: string;
  reply?: string;
  author?: {
    displayName: string;
    photoURL?: string;
  };
  deny?: boolean;
}

/**
 * 클라이언트에서 사용되는 메시지 객체의 인터페이스
 */
export interface InMessage extends MessageBase {
  createAt: string; // 문자열 형태의 생성 일자
  replyAt?: string; // 문자열 형태의 답글 일자 (옵션)
}

/**
 * 서버에서 Firestore에서 가져온 메시지 객체의 인터페이스
 */
export interface InMessageServer extends MessageBase {
  createAt: firestore.Timestamp; // Firestore Timestamp 형태의 생성 일자
  replyAt?: firestore.Timestamp; // Firestore Timestamp 형태의 답글 일자 (옵션)
}
