import { collection, doc } from "firebase/firestore";
import { firestore } from "./firebase/client";

export const generateNewDocumentId = (props: { collection: string }) => {
  try {
    const collectionRef = collection(firestore, props.collection);
    const newDocumentRef = doc(collectionRef);
    const newDocumentId = newDocumentRef.id;
    return newDocumentId;
  } catch (e: any) {
    return e.toString();
  }
};
