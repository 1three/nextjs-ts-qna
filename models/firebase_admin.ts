import * as admin from 'firebase-admin';

// Firebase 설정 인터페이스 정의
interface Config {
  credential: {
    privateKey: string;
    clientEmail: string;
    projectId: string;
  };
}

// FirebaseAdmin 클래스 정의 (싱글톤 패턴 활용)
export default class FirebaseAdmin {
  // FirebaseAdmin의 인스턴스를 담는 정적 변수
  public static instance: FirebaseAdmin;

  // FirebaseAdmin의 초기화 여부를 확인하는 변수
  private init = false;

  // FirebaseAdmin의 인스턴스를 반환하는 정적 메서드
  public static getInstance(): FirebaseAdmin {
    // FirebaseAdmin의 인스턴스가 없거나 null인 경우
    if (FirebaseAdmin.instance === undefined || FirebaseAdmin.instance === null) {
      // 인스턴스를 생성하고 초기화 메서드를 호출하여 Firebase 환경을 설정
      FirebaseAdmin.instance = new FirebaseAdmin();
      FirebaseAdmin.instance.bootstrap();
    }
    // 생성된 인스턴스를 반환
    return FirebaseAdmin.instance;
  }

  // FirebaseAdmin을 초기화하는 메서드
  private bootstrap(): void {
    // 이미 Firebase 앱이 초기화되었는지 확인
    const haveApp = admin.apps.length !== 0;
    if (haveApp) {
      // 이미 초기화된 경우 더 이상 로직을 진행하지 않고 초기화 여부를 true로 설정
      this.init = true;
      return;
    }

    // Firebase 설정을 담은 Config 객체 생성
    const config: Config = {
      credential: {
        privateKey: (process.env.privateKey || '').replace(/\\n/g, '\n'), // 개행 문자 적용되도록 변경
        clientEmail: process.env.clientEmail || '',
        projectId: process.env.projectId || '',
      },
    };

    // Firebase 앱을 초기화하고 환경을 설정
    admin.initializeApp({ credential: admin.credential.cert(config.credential) });
    // console.info('bootstrap firebase admin');
  }

  /** Firestore 인스턴스를 반환하는 메서드 */
  public get Firestore(): FirebaseFirestore.Firestore {
    // FirebaseAdmin이 초기화되지 않은 경우 초기화 메서드 호출
    if (this.init === false) {
      this.bootstrap();
    }
    // Firestore 인스턴스 반환
    return admin.firestore();
  }

  /** Auth 인스턴스를 반환하는 메서드 */
  public get Auth(): admin.auth.Auth {
    // FirebaseAdmin이 초기화되지 않은 경우 초기화 메서드 호출
    if (this.init === false) {
      this.bootstrap();
    }
    // Auth 인스턴스 반환
    return admin.auth();
  }
}
