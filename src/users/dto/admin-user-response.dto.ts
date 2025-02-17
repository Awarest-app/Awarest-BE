/**
 * 관리자 페이지에서 사용자 정보를 반환하기 위한 DTO
 */
export class AdminUserResponseDto {
  /**
   * 사용자 이름
   */
  username: string;

  /**
   * 복호화된 이메일
   */
  email: string;

  /**
   * 설문 결과
   */
  survey: {
    ageRange?: string;
    job?: string;
    goal?: string;
  };

  /**
   * 답변 날짜 목록 (중복 제거됨)
   * 형식: YYYY-MM-DD
   */
  answerDates: string[];
}
