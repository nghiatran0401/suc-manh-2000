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
  if (!folderId) {
    console.error("Sai GD folderId");
    return undefined;
  }

  const order = ["hiện trạng", "khởi công", "tiến độ", "hoàn th"];
  const anhHienTrang = [];
  const anhKhoiCong = [];
  const anhTienDo = [];
  const anhHoanThanh = [];
  const progress = [];
  let thumbnailImage = "https://www.selfdriveeastafrica.com/wp-content/uploads/woocommerce-placeholder.png";

  async function checkForSubfolders(folderId, orderItem, firstLevelFolderName) {
    try {
      const res = await drive.files.list({
        auth: auth,
        q: `'${folderId}' in parents`,
        fields: "files(id, name, mimeType, parents, createdTime)",
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
      // console.error(`[checkForSubfolders] - ${folderId} - ${orderItem} - error: ` + err);
      return undefined;
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
        const allFiles = await checkForSubfolders(folder.id, orderItem, folder.name);
        const files = allFiles.filter((f) => ["image/jpeg", "image/png"].includes(f.mimeType));

        if (files.length > 0) {
          if (orderItem === "hiện trạng") {
            anhHienTrang.push(...files.map((f) => ({ image: `https://drive.google.com/thumbnail?id=${f.id}&sz=w1000`, caption: f.name })));
          }
          if (orderItem === "khởi công") {
            anhKhoiCong.push(...files.map((f) => ({ image: `https://drive.google.com/thumbnail?id=${f.id}&sz=w1000`, caption: f.name })));
          }
          if (orderItem === "tiến độ") {
            anhTienDo.push(...files.map((f) => ({ image: `https://drive.google.com/thumbnail?id=${f.id}&sz=w1000`, caption: f.name })));
          }
          if (orderItem === "hoàn th") {
            anhHoanThanh.push(...files.map((f) => ({ image: `https://drive.google.com/thumbnail?id=${f.id}&sz=w1000`, caption: f.name })));
          }
        }
      }
    } catch (err) {
      // console.error(`[processFirstLevelFolders] - ${folderId} - ${orderItem} - error: ` + err);
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
      const imageObj = imageArray.reduce((latest, image) => {
        return new Date(image.createdTime) > new Date(latest.createdTime) ? image : latest;
      });
      thumbnailImage = imageObj.image;
      break;
    }
  }
  return { thumbnailImage, progress };
}

async function getHoanCanhDescription(folderId) {
  if (!folderId) {
    console.error("Sai GD folderId");
    return undefined;
  }

  try {
    const res = await drive.files.list({
      auth: auth,
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id, name, mimeType, parents)",
    });

    const hienTrangFolder = res.data.files.find((folder) => folder.name.includes("hiện trạng"));
    const filesRes = await drive.files.list({
      auth: auth,
      q: `'${hienTrangFolder.id}' in parents`,
      fields: "files(id, name, mimeType, parents)",
    });

    const googleDocObj = filesRes.data.files.find((file) =>
      ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword", "application/vnd.google-apps.document"].includes(file.mimeType)
    );

    if (googleDocObj.id) {
      return `https://docs.google.com/document/d/${googleDocObj.id}/preview`;
    }
    return undefined;
  } catch (err) {
    // console.error(`[getHoanCanhDescription] - ${folderId} - error: ` + err);
    return undefined;
  }
}

module.exports = { getProjectProgress, getHoanCanhDescription };
