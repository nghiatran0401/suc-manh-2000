import { collection, doc } from "firebase/firestore";
import { firestore } from "./client";
export const generateNewDocumentId = (props: { collection: string }) => {
  try {
    const collectionRef = collection(firestore, "projects");
    const newDocumentRef = doc(collectionRef);
    const newDocumentId = newDocumentRef.id;
    return newDocumentId;
  } catch (e: any) {
    return e.toString();
  }
};
