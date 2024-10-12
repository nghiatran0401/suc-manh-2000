import { google } from "googleapis";
import * as path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
// import * as readline from "readline";
// import * as fs from "fs";

const drive = google.drive("v3");
const auth = new google.auth.OAuth2(process.env.GOOGLE_API_CLIENT_ID, process.env.GOOGLE_API_CLIENT_SECRET, process.env.SERVER_URL);

async function ensureRefreshToken() {
  const refreshToken = process.env.GOOGLE_API_REFRESH_TOKEN;

  if (refreshToken) {
    auth.setCredentials({ refresh_token: refreshToken });

    try {
      const newToken = await auth.getAccessToken();
      if (newToken.token) {
        auth.setCredentials({ access_token: newToken.token, refresh_token: refreshToken });
      } else {
        console.error("Failed to obtain a new access token. Response:", newToken);
      }
    } catch (err: any) {
      if (err.response && err.response.data.error === "invalid_grant") {
        console.error("Refresh token expired or revoked. Initiating reauthentication.");
        // initiateReauthentication();
      } else {
        console.error("Failed to refresh access token: ", err.response ? err.response.data : err.message);
      }
    }
  } else {
    console.error("No refresh token available. Cannot obtain a new access token.");
  }
}

// function initiateReauthentication() {
//   const authUrl = auth.generateAuthUrl({
//     access_type: "offline",
//     scope: ["https://www.googleapis.com/auth/drive"],
//   });

//   console.log("Authorize this app by visiting this url:", authUrl);

//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });

//   rl.question("Enter the authorization code here: ", async (code) => {
//     rl.close();
//     try {
//       const { tokens } = await auth.getToken(code);
//       auth.setCredentials(tokens);
//       console.log("Access Token:", tokens.access_token);
//       console.log("Refresh Token:", tokens.refresh_token);

//       const tokenPath = path.join(__dirname, "tokens.json");
//       fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2), (err) => {
//         if (err) {
//           console.error("Error saving tokens to file:", err);
//         } else {
//           console.log("Tokens saved to", tokenPath);
//         }
//       });
//     } catch (err: any) {
//       console.error("Failed to exchange authorization code for tokens: ", err.response ? err.response.data : err.message);
//     }
//   });
// }

async function getProjectProgress(folderId: string) {
  if (!folderId) {
    console.error(`Sai GD folderId: ${folderId}`);
    return undefined;
  }

  await ensureRefreshToken();

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

  await ensureRefreshToken();

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

export { getProjectProgress, getHoanCanhDescription };
