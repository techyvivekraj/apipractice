export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
];

export const UPLOAD_FIELDS = [
  { name: 'educationalDocs', maxCount: 5 },
  { name: 'professionalDocs', maxCount: 5 },
  { name: 'identityDocs', maxCount: 5 },
  { name: 'addressDocs', maxCount: 5 },
  { name: 'otherDocs', maxCount: 5 }
]; 