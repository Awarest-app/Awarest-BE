export const ageGroups = [
  'Under 18',
  '18 - 22',
  '23 - 26',
  '27 - 34',
  '35 - 44',
  '45+',
] as const; // as const를 붙이면 리터럴 타입으로 간주됩니다.

export const goalOptions = [
  'Understand myself better',
  'Find life direction',
  'No specific purpose',
  'Discover my purpose',
  'Build strong habits',
  'Other',
] as const;

export const workWordsOptions = [
  'Student',
  'Retired',
  'Engineer',
  'Developer',
  'Sales',
  'Founder',
  'Artist',
  'Designer',
  'Investor',
  'Teacher',
  'Other',
] as const;

export const heardFromOptions = [
  'Friends',
  'Google search',
  'Appstore',
  'Reddit',
  'Instagram',
  'Threads',
  'Advertisement',
  'Social media',
  'Other',
] as const;
