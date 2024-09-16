const { google } = require("googleapis");
const drive = google.drive("v3");
const fs = require("fs");
const readline = require("readline");

// fs.readFile("./scripts/credentials.json", (err, content) => {
//   if (err) return console.log("Error loading client secret file:", err);
//   authorize(JSON.parse(content), getProjectProgress);
// });

// function authorize(credentials, callback) {
//   const { client_secret, client_id, redirect_uris } = credentials.installed;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   fs.readFile("token.json", (err, token) => {
//     if (err) return getAccessToken(oAuth2Client, callback);
//     oAuth2Client.setCredentials(JSON.parse(token));
//     callback(oAuth2Client);
//   });
// }

// function getAccessToken(oAuth2Client, callback) {
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: "offline",
//     scope: ["https://www.googleapis.com/auth/drive.metadata.readonly"],
//   });
//   console.log("Authorize this app by visiting this url:", authUrl);
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   rl.question("Enter the code from that page here: ", (code) => {
//     rl.close();
//     oAuth2Client.getToken(code, (err, token) => {
//       if (err) return console.error("Error retrieving access token", err);
//       oAuth2Client.setCredentials(token);
//       fs.writeFile("./scripts/token.json", JSON.stringify(token), (err) => {
//         if (err) return console.error(err);
//         console.log("Token stored to", "token.json");
//       });
//       callback(oAuth2Client);
//     });
//   });
// }

const { client_secret, client_id, redirect_uris } = require("./credentials.json").installed;
const token = require("./token.json");
const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
auth.setCredentials(token);

async function getProjectProgress(folderId) {
  if (!folderId) return undefined;

  const order = ["hiện trạng", "tiến độ", "hoàn th"];
  const anhTienDo = [];
  const anhHienTrang = [];
  const anhHoanThanh = [];
  const progress = [];

  async function checkForSubfolders(folderId, orderItem, firstLevelFolderName) {
    try {
      const res = await drive.files.list({
        auth: auth,
        q: `'${folderId}' in parents`,
        fields: "files(id, name, mimeType, parents)",
      });

      const subfolders = res.data.files.filter((file) => file.mimeType === "application/vnd.google-apps.folder");
      const files = res.data.files.filter((file) => file.mimeType !== "application/vnd.google-apps.folder");

      if (subfolders.length) {
        const subfolderPromises = subfolders.map((folder) => {
          return checkForSubfolders(folder.id, orderItem, firstLevelFolderName);
        });

        const results = await Promise.all(subfolderPromises);
        const allFiles = results.flat().concat(files);
        return allFiles;
      } else {
        return files;
      }
    } catch (err) {
      throw new Error("The API returned an error: " + err);
    }
  }

  async function processFirstLevelFolders(folderId, orderItem) {
    try {
      const res = await drive.files.list({
        auth: auth,
        q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
        fields: "files(id, name, mimeType, parents)",
      });

      const firstLevelFolders = res.data.files.filter((folder) => folder.name.includes(orderItem));

      for (const folder of firstLevelFolders) {
        const files = await checkForSubfolders(folder.id, orderItem, folder.name);
        if (orderItem === "hiện trạng") {
          anhHienTrang.push(...files.map((f) => ({ image: `https://drive.google.com/thumbnail?id=${f.id}&sz=w1000`, caption: f.name })));
        }
        if (orderItem === "tiến độ") {
          anhTienDo.push(...files.map((f) => ({ image: `https://drive.google.com/thumbnail?id=${f.id}`, caption: f.name })));
        }
        if (orderItem === "hoàn th") {
          anhHoanThanh.push(...files.map((f) => ({ image: `https://drive.google.com/thumbnail?id=${f.id}`, caption: f.name })));
        }
      }
    } catch (err) {
      console.error(`[processFirstLevelFolders] - ${folderId} - ${orderItem} - error: ` + err);
    }
  }

  for (const orderItem of order) {
    await processFirstLevelFolders(folderId, orderItem);
  }

  progress.push({ name: "Ảnh hiện trạng", images: anhHienTrang });
  progress.push({ name: "Ảnh tiến độ", images: anhTienDo });
  progress.push({ name: "Ảnh hoàn thiện", images: anhHoanThanh });
  return progress;
}

async function getHoanCanhDescription(folderId) {
  if (!folderId) return undefined;

  try {
    const res = await drive.files.list({
      auth: auth,
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id, name, mimeType, parents)",
    });

    const hienTrangFolder = res.data.files.find((folder) => folder.name.includes("hiện trạng"));
    if (!hienTrangFolder) return null;

    const filesRes = await drive.files.list({
      auth: auth,
      q: `'${hienTrangFolder.id}' in parents`,
      fields: "files(id, name, mimeType, parents)",
    });

    const googleDoc = filesRes.data.files.find((file) => file.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    return googleDoc ? googleDoc : null;
  } catch (err) {
    console.error("[getHoanCanhDescription] error" + err);
    return undefined;
  }
}

module.exports = { getProjectProgress, getHoanCanhDescription };
