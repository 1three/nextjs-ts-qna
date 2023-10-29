import FirebaseAdmin from '../firebase_admin';
import { InAuthUser } from '../in_auth_user';

// Firestore의 컬렉션 이름 상수화
const MEMBER_COL = 'members';
const SCR_NAME_COL = 'screen_names';

type AddResult = { result: true; id: string } | { result: false; message: string };

/**
 * 사용자를 Firestore에 추가하는 함수
 *
 * @param {InAuthUser} param0 사용자 정보
 * @returns {Promise<AddResult>} 추가 결과
 */
async function add({ uid, email, displayName, photoURL }: InAuthUser): Promise<AddResult> {
  try {
    // Firestore 트랜잭션을 이용한 데이터 추가
    const screenName = (email as string).replace('@gmail.com', '');
    const addResult = await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
      // members 컬렉션의 해당 uid 문서 가져오기
      const memberRef = FirebaseAdmin.getInstance().Firestore.collection(MEMBER_COL).doc(uid);

      // screen_names 컬렉션의 해당 screenName 문서 가져오기
      const screenNameRef = FirebaseAdmin.getInstance().Firestore.collection(SCR_NAME_COL).doc(screenName);

      // 해당 uid의 member 문서가 이미 존재한다면 추가하지 않고 반환
      const memberDoc = await transaction.get(memberRef);
      if (memberDoc.exists) {
        return false;
      }

      // 추가할 새 사용자의 데이터
      const addData = {
        uid,
        email,
        displayName: displayName ?? '',
        photoURL: photoURL ?? '',
      };

      // members, screen_names 컬렉션에 데이터 추가
      await transaction.set(memberRef, addData);
      await transaction.set(screenNameRef, addData);

      return true;
    });

    // 데이터 추가 결과에 따라 응답 반환
    if (addResult === false) {
      return { result: true, id: uid };
    }
    return { result: true, id: uid };
  } catch (err) {
    // 에러 발생 시 500 에러 반환
    console.error(err);
    return { result: false, message: '서버 오류' };
  }
}

/**
 * screenName으로 사용자를 조회하는 함수
 *
 * @param {string} screenName 조회할 사용자의 screenName
 * @returns {Promise<InAuthUser | null>} 조회된 사용자 정보
 */
async function findByScreenName(screenName: string): Promise<InAuthUser | null> {
  const memberRef = FirebaseAdmin.getInstance().Firestore.collection(SCR_NAME_COL).doc(screenName);
  const memberDoc = await memberRef.get();

  // 조회된 사용자가 없는 경우
  if (memberDoc.exists === false) {
    return null;
  }

  // 조회된 사용자 정보 반환
  const data = memberDoc.data() as InAuthUser;
  return data;
}

const MemberModel = {
  add,
  findByScreenName,
};

export default MemberModel;
