import { google } from "googleapis";
import { firestore } from "../firebase";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const drive = google.drive("v3");
const auth = new google.auth.OAuth2(process.env.GOOGLE_API_CLIENT_ID, process.env.GOOGLE_API_CLIENT_SECRET, process.env.SERVER_URL + "/script/oauth2callback");

function generateAuthUrl() {
  const urlObj = { access_type: "offline", scope: ["https://www.googleapis.com/auth/drive"], prompt: "consent" };
  return auth.generateAuthUrl(urlObj);
}

async function saveGoogleAuthRefreshToken(code: string) {
  try {
    const { tokens } = await auth.getToken(code);
    auth.setCredentials(tokens);

    if (tokens.refresh_token) {
      const querySnapshot = await firestore.collection("credentials").get();
      if (querySnapshot.docs.length > 0) {
        const batch = firestore.batch();
        querySnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      }
      const newId = uuidv4().replace(/-/g, "").substring(0, 20);
      const postDocRef = firestore.collection("credentials").doc(newId);
      await postDocRef.set({ google_auth_refresh_token: tokens.refresh_token });
    }
  } catch (e) {
    console.error(e);
  }
}

async function checkIfRefreshTokenValid() {
  const querySnapshot = await firestore.collection("credentials").get();
  if (querySnapshot.empty) return false;
  const firstDoc = querySnapshot.docs[0];
  const firstDocData = firstDoc.data();
  const refreshToken = firstDocData?.google_auth_refresh_token;

  if (refreshToken) {
    try {
      auth.setCredentials({ refresh_token: refreshToken });
      const newTokens = await auth.getAccessToken();
      if (newTokens.token) {
        auth.setCredentials({ access_token: newTokens.token, refresh_token: refreshToken });
        return true;
      }
    } catch (err: any) {
      console.error("Failed to refresh access token: ", err.response ? err.response.data : err.message);
      return false;
    }
  }
  return false;
}

async function getProjectProgress(folderId: string) {
  if (!folderId) {
    console.error(`Sai GD folderId: ${folderId}`);
    return undefined;
  }

  const order = ["hiện trạng", "khởi công", "tiến độ", "hoàn th"];
  const anhHienTrang: any = [];
  const anhKhoiCong: any = [];
  const anhTienDo: any = [];
  const anhHoanThanh: any = [];
  const progress = [];
  let thumbnailImage = "";

  async function checkForSubfolders(folderId: any, orderItem: any, firstLevelFolderName: any) {
    try {
      const res: any = await drive.files.list({
        auth: auth,
        q: `'${folderId}' in parents`,
        fields: "files(id, name, mimeType, parents, createdTime)",
      });

      const subfolders = res.data.files.filter((file: any) => file.mimeType === "application/vnd.google-apps.folder");
      const files = res.data.files.filter((file: any) => file.mimeType !== "application/vnd.google-apps.folder");

      if (subfolders.length) {
        const subfolderPromises = subfolders.map((folder: any) => {
          return checkForSubfolders(folder.id, orderItem, firstLevelFolderName);
        });

        const results: any = await Promise.all(subfolderPromises);
        const allFiles = results.flat().concat(files);
        return allFiles;
      } else {
        return files;
      }
    } catch (err) {
      console.error(`[checkForSubfolders] - ${folderId} - ${orderItem} - error: ` + err);
      return undefined;
    }
  }

  async function processFirstLevelFolders(folderId: any, orderItem: any) {
    try {
      const res: any = await drive.files.list({
        auth: auth,
        q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
        fields: "files(id, name, mimeType, parents)",
      });

      const firstLevelFolders = res.data.files.filter((folder: any) => folder.name.includes(orderItem));

      for (const folder of firstLevelFolders) {
        const allFiles = await checkForSubfolders(folder.id, orderItem, folder.name);
        const files = allFiles.filter((f: any) => ["image/jpeg", "image/png"].includes(f.mimeType));

        if (files.length > 0) {
          if (orderItem === "hiện trạng") {
            anhHienTrang.push(...files.map((f: any) => ({ image: `https://drive.google.com/thumbnail?id=${f.id}&sz=w1000`, caption: f.name })));
          }
          if (orderItem === "khởi công") {
            anhKhoiCong.push(...files.map((f: any) => ({ image: `https://drive.google.com/thumbnail?id=${f.id}&sz=w1000`, caption: f.name })));
          }
          if (orderItem === "tiến độ") {
            anhTienDo.push(...files.map((f: any) => ({ image: `https://drive.google.com/thumbnail?id=${f.id}&sz=w1000`, caption: f.name })));
          }
          if (orderItem === "hoàn th") {
            anhHoanThanh.push(...files.map((f: any) => ({ image: `https://drive.google.com/thumbnail?id=${f.id}&sz=w1000`, caption: f.name })));
          }
        }
      }
    } catch (err) {
      console.error(`[processFirstLevelFolders] - ${folderId} - ${orderItem} - error: ` + err);
      return undefined;
    }
  }

  for (const orderItem of order) {
    await processFirstLevelFolders(folderId, orderItem);
  }

  progress.push({ name: "Ảnh hiện trạng", images: anhHienTrang });
  progress.push({ name: "Ảnh tiến độ", images: anhTienDo.concat(anhKhoiCong) });
  progress.push({ name: "Ảnh hoàn thiện", images: anhHoanThanh });

  const imageArrays = [anhHoanThanh, anhTienDo.concat(anhKhoiCong), anhHienTrang];
  for (const imageArray of imageArrays) {
    if (imageArray.length > 0) {
      const imageObj = imageArray.reduce((latest: any, image: any) => {
        return new Date(image.createdTime) > new Date(latest.createdTime) ? image : latest;
      });
      thumbnailImage = imageObj.image;
      break;
    }
  }
  return { thumbnailImage, progress };
}

async function getHoanCanhDescription(folderId: string) {
  if (!folderId) {
    console.error(`Sai GD folderId: ${folderId}`);
    return undefined;
  }

  try {
    const res: any = await drive.files.list({
      auth: auth,
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id, name, mimeType, parents)",
    });

    const hienTrangFolder = res.data.files.find((folder: any) => folder.name.includes("hiện trạng"));
    const filesRes: any = await drive.files.list({
      auth: auth,
      q: `'${hienTrangFolder?.id}' in parents`,
      fields: "files(id, name, mimeType, parents)",
    });

    const googleDocObj = filesRes.data.files.find((file: any) =>
      ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword", "application/vnd.google-apps.document"].includes(file.mimeType)
    );

    if (googleDocObj?.id) {
      return `https://docs.google.com/document/d/${googleDocObj?.id}/preview`;
    }
    return undefined;
  } catch (err) {
    console.error(`[getHoanCanhDescription] - ${folderId} - error: ` + err);
    return undefined;
  }
}

async function getAllFileNames(folderId: string) {
  if (!folderId) {
    console.error(`Invalid folderId: ${folderId}`);
    return undefined;
  }

  const allFileNames: any = {};

  async function fetchFilesRecursively(currentFolderId: string, parent: any) {
    try {
      const res: any = await drive.files.list({
        auth: auth,
        q: `'${currentFolderId}' in parents`,
        fields: "files(id, name, mimeType, parents, createdTime)",
      });

      const subfolders = res.data.files.filter((file: any) => file.mimeType === "application/vnd.google-apps.folder");
      const files = res.data.files.filter((file: any) => ["image/jpeg", "image/png"].includes(file.mimeType));

      // Add image files to the current parent object
      parent.files = files.map((file: any) => ({
        name: file.name.replace(/^\d+|\.jpe?g$|\.png$/gi, "").trim(),
        imageUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`,
      }));

      // Recursively fetch files from subfolders
      for (const subfolder of subfolders) {
        parent[subfolder.name] = {}; // Create a new key for the subfolder
        await fetchFilesRecursively(subfolder.id, parent[subfolder.name]);
      }
    } catch (err) {
      console.error(`[fetchFilesRecursively] - ${currentFolderId} - error: ` + err);
    }
  }

  await fetchFilesRecursively(folderId, allFileNames);

  return allFileNames;
}

export { generateAuthUrl, saveGoogleAuthRefreshToken, checkIfRefreshTokenValid, getProjectProgress, getHoanCanhDescription, getAllFileNames };
