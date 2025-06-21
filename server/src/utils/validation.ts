export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateVoteContent = (content: string): ValidationResult => {
  if (!content) {
    return { isValid: false, error: '投票内容が空です' };
  }

  if (typeof content !== 'string') {
    return { isValid: false, error: '投票内容は文字列である必要があります' };
  }

  if (content.length > 1024) {
    return { isValid: false, error: '投票内容は1024文字以内で入力してください' };
  }

  return { isValid: true };
};

export const validateVoteKey = (key: string): ValidationResult => {
  if (!key) {
    return { isValid: false, error: '投票キーが空です' };
  }

  if (typeof key !== 'string') {
    return { isValid: false, error: '投票キーは文字列である必要があります' };
  }

  if (key.length > 100) {
    return { isValid: false, error: '投票キーは100文字以内で入力してください' };
  }

  return { isValid: true };
};

export const validateVoteMessage = (data: any): ValidationResult => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'データが無効です' };
  }

  const keyValidation = validateVoteKey(data.key);
  if (!keyValidation.isValid) {
    return keyValidation;
  }

  const contentValidation = validateVoteContent(data.content);
  if (!contentValidation.isValid) {
    return contentValidation;
  }

  return { isValid: true };
};
