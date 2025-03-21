export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const UPLOAD_FIELDS = [
  { name: 'educationalDocuments', maxCount: 5 },
  { name: 'professionalDocuments', maxCount: 5 },
  { name: 'identityDocuments', maxCount: 5 },
  { name: 'addressDocuments', maxCount: 5 },
  { name: 'otherDocuments', maxCount: 5 }
]; 