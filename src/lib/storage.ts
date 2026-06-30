import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { storage } from './firebase';

function timestampedFileName(prefix: string) {
  return `${prefix}-${Date.now()}.jpg`;
}

export async function uploadIssueImage(uid: string, issueId: string, dataUrl: string) {
  const imageRef = ref(storage, `report-images/${uid}/${timestampedFileName(issueId)}`);
  await uploadString(imageRef, dataUrl, 'data_url');
  return getDownloadURL(imageRef);
}

export async function uploadResolvedIssueImage(
  departmentId: string,
  issueId: string,
  dataUrl: string
) {
  const imageRef = ref(storage, `resolved-images/${departmentId}/${timestampedFileName(issueId)}`);
  await uploadString(imageRef, dataUrl, 'data_url');
  return getDownloadURL(imageRef);
}
