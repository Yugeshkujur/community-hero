/**
 * Firestore's setDoc()/addDoc()/updateDoc() throw at runtime if any field value
 * is `undefined` (unlike `null`, which Firestore accepts fine). This is an easy
 * footgun: any optional field on an object — especially ones built from external
 * data like an AI response — can silently end up `undefined` and crash the write.
 *
 * stripUndefined() removes those keys entirely before the object reaches Firestore,
 * so optional/missing fields are just absent from the document instead of blowing
 * up the whole write.
 *
 * Use it at the call site, right before every setDoc/addDoc/updateDoc:
 *   await setDoc(doc(db, 'reports', id), stripUndefined(issue));
 */
export function stripUndefined<T extends object>(obj: T): T {
    const result: any = {};
    for (const key in obj) {
        if ((obj as any)[key] !== undefined) {
            result[key] = (obj as any)[key];
        }
    }
    return result as T;
}