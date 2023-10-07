/**
 * 사용자 인증 정보를 나타내는 인터페이스
 */
export interface InAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
