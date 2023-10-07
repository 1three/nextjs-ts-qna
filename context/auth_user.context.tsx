/* eslint-disable @typescript-eslint/no-empty-function */

import { createContext, useContext } from 'react';
import { InAuthUser } from '@/models/in_auth_user';
import useFirebaseAuth from '@/hooks/use_firebase_auth';

// AuthUserContext 타입 정의
interface InAuthUserContext {
  authUser: InAuthUser | null; // 로그인 사용자 정보
  loading: boolean; // 로그인 상태 확인 여부
  signInWithGoogle: () => void; // 구글 로그인 함수
  signOut: () => void; // 로그아웃 함수
}

/**
 * AuthUserContext: 인증 정보를 제공하는 React 컨텍스트
 */
const AuthUserContext = createContext<InAuthUserContext>({
  authUser: null,
  loading: true,
  signInWithGoogle: async () => ({ user: null, credential: null }),
  signOut: () => {},
});

/**
 * AuthUserProvider: AuthUserContext의 값을 자식 컴포넌트들에게 제공하는 React 프로바이더
 * @param children - 자식 컴포넌트들
 */
export const AuthUserProvider = function ({ children }: { children: React.ReactNode }) {
  // useFirebaseAuth 훅을 사용하여 인증 정보를 가져와서 컨텍스트 값으로 설정
  const auth = useFirebaseAuth();

  // AuthUserContext.Provider로 자식 컴포넌트들에게 인증 정보를 전달
  return <AuthUserContext.Provider value={auth}>{children}</AuthUserContext.Provider>;
};

/**
 * useAuth: AuthUserContext의 값을 사용하기 위한 훅
 * @returns {InAuthUserContext} AuthUserContext의 값
 */
export const useAuth = () => useContext(AuthUserContext);
