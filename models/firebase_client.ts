import { getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import getConfig from 'next/config';

// Next.js의 publicRuntimeConfig에서 Firebase 설정을 가져옴
const { publicRuntimeConfig } = getConfig();

// Firebase의 API 키 및 인증 정보 설정
const FirebaseCredentials = {
  apiKey: publicRuntimeConfig.apiKey,
  authDomain: publicRuntimeConfig.authDomain,
  projectId: publicRuntimeConfig.projectId,
};

// FirebaseClient 클래스 정의
export default class FirebaseClient {
  // FirebaseClient의 인스턴스를 담는 정적 변수
  private static instance: FirebaseClient;

  // Firebase Auth 인스턴스를 담는 변수
  private auth: Auth;

  // FirebaseClient의 생성자
  public constructor() {
    // 이미 초기화된 Firebase 앱이 있는지 확인
    const apps = getApps();
    if (apps.length === 0) {
      // Firebase 앱이 초기화되지 않은 경우, FirebaseCredentials를 사용하여 앱 초기화
      // console.info('firebase client init start');
      initializeApp(FirebaseCredentials);
    }

    // Firebase Auth 인스턴스 초기화
    this.auth = getAuth();
    // console.info('firebase auth');
  }

  // FirebaseClient의 인스턴스를 반환하는 정적 메서드
  public static getInstance(): FirebaseClient {
    // FirebaseClient의 인스턴스가 없거나 null인 경우
    if (FirebaseClient.instance === undefined || FirebaseClient.instance === null) {
      // 인스턴스를 생성하고 초기화 메서드를 호출하여 Firebase 환경을 설정
      FirebaseClient.instance = new FirebaseClient();
    }
    // 생성된 인스턴스를 반환
    return FirebaseClient.instance;
  }

  /** Auth 인스턴스를 반환하는 메서드 */
  public get Auth(): Auth {
    // Auth 인스턴스 반환
    return this.auth;
  }
}
