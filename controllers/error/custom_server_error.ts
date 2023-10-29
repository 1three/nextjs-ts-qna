/**
 * 사용자 정의 서버 오류를 처리하기 위한 클래스
 */
export default class CustomServerError extends Error {
  public statusCode: number;

  public location?: string;

  constructor({ statusCode = 500, message, location }: { statusCode?: number; message: string; location?: string }) {
    super(message);
    this.statusCode = statusCode;
    this.location = location;
  }

  serializeErrors(): { message: string } | string {
    return { message: this.message };
  }
}
