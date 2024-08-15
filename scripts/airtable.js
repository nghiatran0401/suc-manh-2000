const { firestore, firebase } = require("./firebase");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");

async function finetuneProjectsData(year) {
  const csvFilePath = path.resolve(__dirname, "./projects.csv");
  const results = {};
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (data) => {
      const trimmedData = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          trimmedData[key.trim()] = data[key];
        }
      }
      const year = trimmedData["Năm thực hiện"];
      if (!year) return;
      if (!results[year]) results[year] = [];
      results[year].push({
        id: trimmedData["DA"].trim(),
        // name: trimmedData["Tên công trình"],
        // classification: trimmedData["Phân loại công trình"],
        // status: trimmedData["Tình trạng xây"],
        // totalMoney: Number(trimmedData["Trị giá tiền"].replace("VNĐ ", "")),
        donors: trimmedData["Donors - CHỐT"]
          .split(",")
          .filter((d) => d)
          .map((donor) => ({ name: donor.replace(/[\b]/g, "").trim() })),
        location: {
          province: trimmedData["Tỉnh/thành (update)"].includes("Tỉnh") ? trimmedData["Tỉnh/thành (update)"].replace("Tỉnh", "").trim() : trimmedData["Tỉnh/thành (update)"].trim(),
          district: trimmedData["Huyện"].includes("Huyện") ? trimmedData["Huyện"].replace("Huyện", "").trim() : trimmedData["Huyện"].trim(),
          commune: trimmedData["Xã"].includes("Xã") ? trimmedData["Xã"].replace("Xã", "").trim() : trimmedData["Xã"].trim(),
        },
        metadata: {
          constructionItems: trimmedData["Hạng mục công trình"].trim(),
          type: trimmedData["Hạng mục"].trim(),
          stage: trimmedData["Cấp"].includes("Cấp") ? trimmedData["Cấp"].replace("Cấp", "").trim() : trimmedData["Cấp"].trim(),
          totalStudents: trimmedData["Số HS"].trim() === "" ? null : Number(trimmedData["Số HS"].trim()),
          totalClassrooms: trimmedData["Số PH"].trim() === "" ? null : Number(trimmedData["Số PH"].trim()),
          totalPublicAffairsRooms: trimmedData["Số CV"].trim() === "" ? null : Number(trimmedData["Số CV"].trim()),
          totalRooms: trimmedData["Số p.ở"].trim() === "" ? null : Number(trimmedData["Số p.ở"].trim()),
          totalKitchens: trimmedData["Số bếp"].trim() === "" ? null : Number(trimmedData["Số bếp"].trim()),
          totalToilets: trimmedData["Số WC"].trim() === "" ? null : Number(trimmedData["Số WC"].trim()),
          progress: trimmedData["Follow up Step"].replace(/^\d+\.\s*/, "").trim(),
        },
      });
    })
    .on("end", async () => {
      const totalAirtableData = results[year];
      console.log("Year:", year);
      console.log("Total:", totalAirtableData.length);

      const collection = firestore.collection(`du-an-${year}`);
      const snapshot = await collection.get();

      for (const airtableData of totalAirtableData) {
        snapshot.docs.map(async (doc) => {
          const firestoreData = doc.data();
          const airtableDataId = airtableData["id"];
          if (firestoreData.name.includes(airtableDataId)) {
            console.log("--->", doc.id);
            await collection.doc(doc.id).update({
              donors: airtableData.donors,
              location: {
                ...firestoreData.location,
                province: airtableData.location.province,
                district: airtableData.location.district,
                commune: airtableData.location.commune,
              },
              metadata: airtableData.metadata,
            });
          }
        });
      }
    });
}
// finetuneProjectsData("2024");

// function finetuneDonorsData() {
//   const csvFilePath = path.resolve(__dirname, "./donors.csv");
//   const results = [];

//   fs.createReadStream(csvFilePath)
//     .pipe(csv())
//     .on("data", (data) => {
//       const trimmedData = {};
//       for (const key in data) {
//         if (data.hasOwnProperty(key)) {
//           trimmedData[key.trim()] = data[key];
//         }
//       }

//       if (trimmedData["Tên Tài Trợ"]) {
//         let totalFundedProjects = [];
//         let temp = "";
//         let isConcatenating = false;

//         for (let project of trimmedData["Công trình Total 6"].split(",")) {
//           project = project.trim();
//           if (project.startsWith('"')) {
//             isConcatenating = true;
//             temp = project;
//           } else if (isConcatenating) {
//             temp += `, ${project}`;
//             if (project.endsWith('"')) {
//               isConcatenating = false;
//               totalFundedProjects.push(temp.replace(/^"|"$/g, ""));
//               temp = "";
//             }
//           } else {
//             totalFundedProjects.push(project);
//           }
//         }
//         if (isConcatenating) {
//           totalFundedProjects.push(temp.replace(/^"|"$/g, ""));
//         }

//         results.push({
//           name: trimmedData["Tên Tài Trợ"],
//           // location: trimmedData["Local"],
//           // type: trimmedData["Loại"],
//           // contact1: trimmedData["Thông tin liên hệ"],
//           // contact2: trimmedData["Contacts"],
//           totalFundedProjects: totalFundedProjects,
//         });
//       }
//     })
//     .on("end", async () => {
//       console.log("Total data:", results.length);

//       const collection = firestore.collection("nha-tai-tro");
//       results.forEach(async (result) => {
//         try {
//           await collection.add(result);
//           console.log(result);
//         } catch (error) {
//           console.error("Error: ", error);
//         }
//       });
//     });
// }
// finetuneDonorsData();
