import { useEffect, useState } from 'react';
import { GoogleAuthProvider, User, signInWithPopup } from 'firebase/auth';
import { InAuthUser } from '@/models/in_auth_user';
import FirebaseClient from '@/models/firebase_client';

/**
 * Firebase 인증을 다루기 위한 커스텀 훅
 * @returns {Object} 사용자 정보와 로딩 상태, 로그인 및 로그아웃 함수를 포함한 객체
 */
export default function useFirebaseAuth() {
  // 사용자 정보, 로딩 상태를 관리하는 상태
  const [authUser, setAuthUser] = useState<InAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Google 로그인 함수
   * @returns {Promise<void>} 로그인 결과를 처리하는 Promise
   */
  async function signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      const signInResult = await signInWithPopup(FirebaseClient.getInstance().Auth, provider);
      // 로그인 성공 시
      if (signInResult.user) {
        console.info(signInResult.user);
      }
    } catch (error) {
      // 로그인 실패 시
      console.error(error);
    }
  }
  /**
   * 사용자 정보 초기화 함수
   */
  const clear = () => {
    setAuthUser(null);
    setLoading(true);
  };

  /**
   * 로그아웃 함수
   */
  const signOut = () => FirebaseClient.getInstance().Auth.signOut().then(clear);

  /**
   * Auth 상태 변화 감지 함수
   * @param {User | null} authState - Auth의 상태 정보
   */
  const authStateChanged = async (authState: User | null) => {
    // 로그인한 사용자가 없을 경우 상태 초기화
    if (authState === null) {
      setAuthUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    // 로그인한 사용자 정보 설정
    setAuthUser({
      uid: authState.uid,
      email: authState.email,
      photoURL: authState.photoURL,
      displayName: authState.displayName,
    });
    setLoading(false);
  };

  /**
   * 컴포넌트 마운트 시, Auth 상태 변화를 감지하는 함수 등록
   */
  useEffect(() => {
    const unsubscribe = FirebaseClient.getInstance().Auth.onAuthStateChanged(authStateChanged);
    // 컴포넌트 언마운트 시 등록된 함수 해제
    return () => unsubscribe();
  }, []);

  return {
    authUser,
    loading,
    signInWithGoogle,
    signOut,
  };
}
