import { collection, doc } from "firebase/firestore";
import { firestore } from "../firebase/client";

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

export const capitalizeEachWord = (str: any) => {
  return str
    .split(" ")
    .map((word: any, index: any, arr: any) => {
      if (word.includes("DA")) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};
