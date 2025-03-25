// Cookie management for clickwrap agreement
export const setAgreementCookie = (): void => {
  document.cookie = "userAgreed=true; path=/; max-age=31536000"; // 1 year expiration
};

export const checkAgreementCookie = (): boolean => {
  return document.cookie.split(';').some(cookie => cookie.trim().startsWith('userAgreed='));
};