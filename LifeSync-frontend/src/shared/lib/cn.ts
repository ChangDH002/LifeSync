/**
 * 클래스명 유틸리티
 * 조건부 클래스 적용
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
