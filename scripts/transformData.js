const fs = require("fs");
const fsPromises = require("fs").promises;
const { bucket } = require("../server/firebase");

// TODO: Get high resolution images
// TODO: Render Momo button correctly

function extractUnnecessaryRegex(htmlString) {
  const imgTagRegex = /<img[^>]*>/g;
  const emptyDivRegex = /<div[^>]*>\s*<\/div>\r?\n/g;
  const lineBreaksRegex = /(<[^>]*>)\r\n\r\n\r\n([^<]*<\/[^>]*>)/g;
  const classRegex1 = / class="kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x c1et5uql ii04i59q"/g;
  const classRegex2 =
    / class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x193iq5w xeuugli x1r8uery x1iyjqo2 xs83m0k x10b6aqq x1yrsyyn x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xa49m3k xqeqjp1 x2hbi6w x13fuv20 xu3j5b3 x1q0q8m5 x26u7qi x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1ypdohk xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x3nfvp2 x1q0g3np x87ps6o x1lku1pv x1a2a7pz"/g;
  const classRegex3 =
    / class="oajrlxb2 g5ia77u1 qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 nc684nl6 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl gpro0wi8 q66pz984 b1v8xokw"/g;
  const classRegex4 = / class="x11i5rnm xat24cr x1mh8g0r x1vvkbs xtlvy1s x126k92a"/g;
  const classRegex5 = / class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1qughib x1qjc9v5 xozqiw3 x1q0g3np xjkvuk6 x1iorvi4 x4cne27 xifccgj"/g;
  const classRegex6 = / class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x193iq5w xeuugli x1r8uery x1iyjqo2 xs83m0k x10b6aqq x1yrsyyn"/g;
  const classRegex7 = / class="cxmmr5t8 oygrvhab hcukyx3x c1et5uql o9v6fnle ii04i59q"/g;
  const finetunedContent = htmlString
    .replace(imgTagRegex, "")
    .replace(emptyDivRegex, "")
    .replace(lineBreaksRegex, "")
    .replace(classRegex1, "")
    .replace(classRegex2, "")
    .replace(classRegex3, "")
    .replace(classRegex4, "")
    .replace(classRegex5, "")
    .replace(classRegex6, "")
    .replace(classRegex7, "");

  return finetunedContent;
}

async function transformData() {
  const jsonData = fs.readFileSync("server/original_db.json", "utf8");
  const data = JSON.parse(jsonData).data;

  const transformed_posts = await Promise.all(
    data
      .filter((obj) => obj.post_type === "post" && obj.post_status === "publish" && !obj.post_content.includes("ş") && !obj.post_content.includes("ğ") && !obj.post_content.includes("ö"))
      .map(async (obj) => {
        const { ID, post_author, post_date_gmt, post_title, post_name, post_content } = obj;

        let category;
        if (post_name.includes("cap-nhat-tien-do")) {
          category = "thong-bao";
        } else if (post_name.includes("tai-chinh")) {
          category = "bao-cao-tai-chinh";
        } else if (
          [
            "vtv6-suc-manh-2000-ban-tin-the-he-so-28-4-2020-tren-vtv6",
            "hoi-dua-vov2-len-lam-chuong-trinh-phat-mung-2-tet",
            "viec-tu-te-lan-2-voi-2-du-an-trong-do-co-suc-manh-2000",
            "chuyen-trung-dong-nat-xay-truong-nuoi-tre-vung-cao",
            "anh-sang-nui-rung-so-5-dai-th-ha-noi-cau-noi-yeu-thuong-tap-1",
            "cam-on-viec-tu-te-cam-on-ca-si-ngoc-anh-nhac-si-nguyen-hong-thuan-da-danh-tang-bai-hat-ngan-uoc-mo-viet-nam-cho-hoang-hoa-trung-doi-ngu-nuoi-em-trong-gala-viec-tu-te-thang-4",
            "viec-tu-te-vtv24-hoang-hoa-trung-lan-dau-len-song-nam-2018",
            "bao-thieu-nien-bang-rung-vuot-mua-lu-de-mang-truong-moi-cho-hoc-sinh-muong-toong",
          ].includes(post_name)
        ) {
          category = "bao-chi-truyen-hinh";
        } else if (
          [
            "du-an-lap-nang-luong-gio-mat-troi-cho-cac-diem-truong-chua-bao-gio-co-dien",
            "cau-so-3-tai-lang-kon-trang-kbang-gia-lai-can-191-trieu-cau-sat",
            "chuyen-khoan-tien-nuoi-em-thang-910-hai-huyen-nam-po-va-dien-bien-dong-bao-cao-tai-chinh-so-02-nam-hoc-2020-2021",
            "mo-quyen-gop-1-chia-se-giup-cau-xay-nhanh-cau-so-8-tra-vinh-200-trieu-con-thieu-cho-xay-cau-dan-sinh-tai-ap-soc-cau-xa-hung-hoa-huyen-tieu-can-tra-vinh-da-xuong-cap-venh-nghieng-ca-chan",
            "chuc-mung-04-em-soi-da-co-chu-moi-du-an-em-soi-va-truong-gay-quy-thanh-cong-15-558-888d",
            "4-3-2020-nay-cac-em-chung-minh-lai-co-diem-truong-moi-cam-on-bidv-chi-nhanh-dai-la",
            "ket-qua-nhan-tai-tro-sau-khi-len-thoi-su-19h-26-trieu-ngay-12-4-va-56-trieu-ngay-13-4",
          ].includes(post_name)
        ) {
          category = "tai-tro";
        } else {
          category = "cau-chuyen";
        }

        function extractEmbedUrl(post_content) {
          if (!post_content) {
            return { combined_url: [], contentWithoutEmbeddedUrl: "" };
          }

          const embedRegex = /\[embed\](.*?)\[\/embed\]/g;
          const videoRegex = /\[video.*?mp4="(.*?)".*?\]\[\/video\]/g;

          const embedded_urls = [...post_content.matchAll(embedRegex)].map((match) => match[1]);
          const video_urls = [...post_content.matchAll(videoRegex)].map((match) => match[1]);

          // Remove the embed and video tags from the post_content
          let contentWithoutEmbeddedUrl = post_content.replace(embedRegex, "").replace(videoRegex, "");

          // Combine both URLs into one array
          const combined_urls = [...embedded_urls, ...video_urls];

          return { combined_urls, contentWithoutEmbeddedUrl };
        }

        async function extractImagesAndContent(htmlString) {
          // Regular expression to find image tags and capture their source attribute
          const imageRegex = /<img[^>]+src="(.*?)"[^>]*>/g;
          let matches;
          let images = [];
          let firstImageStartIndex = -1; // Initialize to -1 to indicate no images found

          // This regular expression is used to clean up the src attribute to match the desired output
          const srcCleanupRegex = /^http(s)?:\/\/web\.sucmanh2000\.com\/wp-content\//;

          // Loop over each image tag found
          while ((matches = imageRegex.exec(htmlString)) !== null) {
            const imageUrl = matches[1].replace(srcCleanupRegex, ""); // Clean up the src to required format
            const imageStartIndex = matches.index;
            const imageEndIndex = imageRegex.lastIndex;

            // Check and set the start index of the first image
            if (firstImageStartIndex === -1) {
              firstImageStartIndex = imageStartIndex;
            }

            // Extract caption: starts from the end of current image tag to the start of next image or end of string
            const captionStartIndex = imageEndIndex;
            const captionEndIndex = htmlString.indexOf("<img", captionStartIndex);
            let caption = htmlString.substring(captionStartIndex, captionEndIndex > -1 ? captionEndIndex : undefined).trim();

            // Clean up the caption from any HTML tags or unwanted white spaces/new lines
            caption = caption
              .replace(/<\/?[^>]+(>|$)/g, "")
              .replace(/&nbsp;/g, "")
              .trim(); // Remove HTML tags and &nbsp;
            if (caption) {
              // Split by new lines and take the relevant line for the caption if necessary
              const captionLines = caption.split(/[\r\n]+/);
              caption = captionLines[0]; // Assuming the first line after the image is the caption
            }

            images.push({
              image: imageUrl,
              caption: caption || undefined, // Include the caption only if it's not empty
            });
          }

          // Inherit captions if there are images without captions
          const imageArr = images.filter((image) => image.image?.includes("uploads/"));
          let lastCaption;
          for (let i = 0; i <= imageArr.length - 1; i++) {
            if (imageArr[i].caption) {
              lastCaption = imageArr[i].caption;
            } else if (lastCaption) {
              imageArr[i].caption = lastCaption;
            }
          }

          const imageResults = imageArr.map((image) => {
            let imageUrl = image.image;
            imageUrl = imageUrl.replace(/.*\/uploads\//, "uploads/");
            return { image: imageUrl, caption: image.caption };
          });

          // After extracting the images, get the download URLs
          const imagePromises = imageResults.map(async (image) => {
            const file = bucket.file(image.image);
            const url = await file.getSignedUrl({
              action: "read",
              expires: "03-09-2491",
            });

            return { image: url[0], caption: image.caption };
          });

          const imageObjects = await Promise.all(imagePromises);

          const finetunedContent = extractUnnecessaryRegex(htmlString);

          // Only keep content up to the start of the first image
          let contentWithoutImages;
          const detailIndex = finetunedContent.indexOf("(Chi tiết xem từng ảnh)") || finetunedContent.indexOf("Chi tiết xem từng ảnh") || finetunedContent.indexOf("( Chi tiết xem từng ảnh )");
          if (detailIndex !== -1) {
            contentWithoutImages = finetunedContent.substring(0, detailIndex);
          } else {
            contentWithoutImages = finetunedContent;
          }

          return { images: imageObjects, contentWithoutImages };
        }

        const { combined_urls, contentWithoutEmbeddedUrl } = extractEmbedUrl(post_content);
        const { images, contentWithoutImages } = await extractImagesAndContent(combined_urls && combined_urls.length > 0 ? contentWithoutEmbeddedUrl : post_content);

        // if (post_name === "hoi-dua-vov2-len-lam-chuong-trinh-phat-mung-2-tet") {
        //   console.log("here2", combined_urls);
        // }

        return {
          id: ID,
          author: post_author ? "Hoàng Hoa Trung" : "Admin Group",
          publish_date: post_date_gmt,
          name: post_title,
          slug: post_name,
          category: category,
          content: {
            tabs: [
              {
                name: "Main content",
                description: contentWithoutImages,
                embedded_url: combined_urls,
                slide_show: images,
              },
            ],
          },
        };
      })
  );

  const transformed_attachments = data
    .filter((obj) => obj.post_type === "attachment")
    .map((obj) => {
      const { ID, guid } = obj;
      return {
        id: ID,
        url: guid,
        // title: post_title,
        // type: post_type,
        // mime_type: post_mime_type,
      };
    });

  const transformed_pages = await Promise.all(
    data
      .filter((obj) => obj.post_type === "page" && obj.post_status === "publish")
      .map(async (obj) => {
        const { ID, post_author, post_date_gmt, post_title, post_name, post_content, post_parent } = obj;
        let donor_content, tab1_content, tab2_content, tab3_content;
        let donor_images, tab1_images, tab2_images, tab3_images;
        let description, category, embedded_url;
        let before = [],
          in_progress = [],
          after = [];

        async function extractImages(content) {
          let images = [];
          if (content) {
            const imgSrcPattern = /<img[^>]+src="(.*?)"[^>]*>/g;
            const uxImagePattern = /\[ux_image id="(\d+)"[^]*?\]/g;
            let imgSrcMatch, uxImageMatch;

            while ((imgSrcMatch = imgSrcPattern.exec(content)) !== null) {
              const imageUrl = imgSrcMatch[1] ? imgSrcMatch[1].replace(/http(s)?:\/\/web.sucmanh2000.com\/wp-content\//, "") : null;
              if (!imageUrl) console.log("!imageUrl1", imgSrcMatch[1]);
              images.push(imageUrl);
            }
            while ((uxImageMatch = uxImagePattern.exec(content)) !== null) {
              const imageId = uxImageMatch[1];
              const imageObject = transformed_attachments.find((attachment) => attachment.id === imageId);
              const imageUrl = imageObject ? imageObject.url.replace(/http(s)?:\/\/web.sucmanh2000.com\/wp-content\//, "") : null;
              if (!imageUrl) console.log("!imageUrl2", imageId);
              images.push(imageUrl);
            }
            content = content.replace(/<img[^>]*>/g, "").replace(uxImagePattern, "");
          }

          // After extracting the images, get the download URLs
          const imagePromises = images.map(async (image) => {
            const file = bucket.file(image);
            const url = await file.getSignedUrl({
              action: "read",
              expires: "03-09-2491",
            });

            return url[0];
          });

          return await Promise.all(imagePromises);
        }

        async function extractContent() {
          const patterns = [
            /\[row.*?Tài Trợ.*?\[\/row\]/is,
            /\[tab title="Hoàn cảnh"\](.*?)\[\/tab\]/s,
            /\[tab title="Nhà hảo tâm"\](.*?)\[\/tab\]/s,
            /\[tab title="Mô hình xây"\](.*?)\[\/tab\]/s,
            /\[ux_image_box[^\]]*\](.*?)\[\/ux_image_box\]/s,
            /\[title text="ẢNH HIỆN TRẠNG"(.*?)\[\/col\]/gis,
            /\[title text="ẢNH TIẾN ĐỘ"(.*?)\[\/col\]/gis,
            /\[title text="ẢNH HOÀN THIỆN"(.*?)\[\/col\]/gis,
          ];
          const imgIdPattern = /\[ux_image id="(.*?)"\]/g;
          const results = [donor_content, tab1_content, tab2_content, tab3_content, description];
          const imageArrays = [before, in_progress, after];

          patterns.forEach((pattern, index) => {
            const match = post_content.toString().match(pattern);
            if (index < 5) {
              results[index] = match ? match[0].replace(/\[ux_html\]|\[\/ux_html\]/g, "").trim() : null;
            } else {
              const blockMatch = pattern.exec(post_content.toString());
              if (blockMatch) {
                const block = blockMatch[1];
                let imgIdMatch;
                while ((imgIdMatch = imgIdPattern.exec(block)) !== null) {
                  imageArrays[index - 5].push(imgIdMatch[1]);
                }
              }
            }
          });

          [donor_content, tab1_content, tab2_content, tab3_content, description] = results;
          donor_images = await extractImages(donor_content);
          tab1_images = await extractImages(tab1_content);
          tab2_images = await extractImages(tab2_content);
          tab3_images = await extractImages(tab3_content);

          if (donor_content) {
            const firstColMatch = donor_content.match(/\[row.*?\[col.*?\](.*?)\[\/col\]/is);
            donor_content = firstColMatch ? firstColMatch[1] : null;
            donor_content = extractUnnecessaryRegex(donor_content);
          }
          if (tab1_content) {
            tab1_content = tab1_content.replace(/<img[^>]*>/g, "").replace(/\[(ux_slider|ux_image)\].*?\[\/(ux_slider|ux_image)\]/gs, "");
            tab1_content = extractUnnecessaryRegex(tab1_content);
          }
          if (tab2_content) {
            const iframeMatch = tab2_content.match(/<iframe[^>]*src="([^"]*)"[^>]*>/i);
            if (iframeMatch) {
              embedded_url = iframeMatch[1];
              tab2_content = tab2_content.replace(/<iframe[^>]*>.*?<\/iframe>/gs, "");
            }
            tab2_content = tab2_content.replace(/<img[^>]*>/g, "").replace(/\[(ux_slider|ux_image)[^\]]*\]/gs, "");
            tab2_content = tab2_content.replace(/\[(row_inner|col_inner)[^\]]*\]\s*\n*\s*\[\/(row_inner|col_inner)\]/gs, "");
            tab2_content = tab2_content.replace(/\[(row_inner|col_inner)[^\]]*\]\s*\[\/(row_inner|col_inner)\]/gs, "");
            tab2_content = extractUnnecessaryRegex(tab2_content);
          }
          if (tab3_content) {
            tab3_content = tab3_content.replace(/<img[^>]*>/g, "").replace(/\[(ux_slider|ux_image)\].*?\[\/(ux_slider|ux_image)\]/gs, "");
            tab3_content = tab3_content.replace(/\[(row_inner|col_inner)[^\]]*\]\s*\[\/(row_inner|col_inner)\]/gs, "");
            tab3_content = extractUnnecessaryRegex(tab3_content);
          }
          if (description) {
            description = description.replace(/\[ux_image_box[^\]]*\]/g, "").replace(/\[\/ux_image_box\]/g, "");
            description = extractUnnecessaryRegex(description);
          }

          [before, in_progress, after] = imageArrays;
          [before, in_progress, after] = await Promise.all(
            [before, in_progress, after].map(async (array) =>
              Promise.all(
                array.map(async (item) => {
                  const imageId = item
                    .replace(/" height="[^"]*/g, "")
                    .replace(/" width="[^"]*/g, "")
                    .replace(/" image_size="[^"]*/g, "");
                  const imageObject = transformed_attachments.find((attachment) => attachment.id === imageId);
                  const imageUrl = imageObject ? imageObject.url.replace(/http(s)?:\/\/web.sucmanh2000.com\/wp-content\//, "") : null;
                  if (!imageUrl) return;

                  const file = bucket.file(imageUrl);
                  const url = await file.getSignedUrl({
                    action: "read",
                    expires: "03-09-2491",
                  });

                  return url[0];
                })
              )
            )
          );

          donor_images = donor_images.map((image) => ({ image, caption: "" }));
          tab1_images = tab1_images.map((image) => ({ image, caption: "" }));
          tab2_images = tab2_images.map((image) => ({ image, caption: "" }));
          tab3_images = tab3_images.map((image) => ({ image, caption: "" }));
          before = before.map((image) => ({ image, caption: "" }));
          in_progress = in_progress.map((image) => ({ image, caption: "" }));
          after = after.map((image) => ({ image, caption: "" }));
        }

        function extractCategory() {
          if (post_parent && post_parent !== "0") {
            const parentPost = data.filter((obj) => obj.post_type === "page" && obj.post_status === "publish").find((page) => page.ID === post_parent);
            if (parentPost) {
              category = parentPost.post_name.replace("cac-", "");
            }
          }
        }

        let classification;
        if (post_title.includes("nội trú") || post_title.includes("NỘI TRÚ") || post_title.includes("Nội trú")) {
          classification = "khu-noi-tru";
        } else if (post_title.includes("NHP") || post_title.includes("Nhà Hạnh Phúc") || post_title.includes("Nhà hạnh phúc")) {
          classification = "nha-hanh-phuc";
        } else if (post_title.includes("cầu") || post_title.includes("CẦU") || post_title.includes("Cầu")) {
          classification = "cau-hanh-phuc";
        } else if (
          post_title.includes("trường") ||
          post_title.includes("TRƯỜNG") ||
          post_title.includes("Trường") ||
          post_title.includes("ĐT") ||
          post_title.includes("Mầm non") ||
          post_title.includes("Tiểu học")
          // ||
          // post_title.includes("trung tâm") ||
          // post_title.includes("Điểm") ||
          // post_title.includes("ĐIỂM")
        ) {
          classification = "truong-hoc";
        } else if (post_title.includes("Nhà WC")) {
          classification = "wc";
        } else {
          classification = "loai-khac";
        }

        extractCategory();
        await extractContent();

        return {
          id: ID,
          author: post_author ? "Admin" : "N/A",
          publish_date: post_date_gmt,
          name: post_title,
          description: description,
          slug: post_name,
          category: category,
          classification: classification,
          donor: {
            name: "Nhà tài trợ",
            description: donor_content,
            images: donor_images,
          },
          progress: [
            {
              name: "Ảnh hiện trạng",
              images: before,
            },
            {
              name: "Ảnh tiến độ",
              images: in_progress,
            },
            {
              name: "Ảnh hoàn thiện",
              images: after,
            },
          ],
          content: {
            tabs: [
              {
                name: "Hoàn cảnh",
                description: tab1_content,
                slide_show: tab1_images,
              },
              {
                name: "Nhà hảo tâm",
                description: tab2_content,
                embedded_url: embedded_url,
                slide_show: tab2_images,
              },
              {
                name: "Mô hình xây",
                description: tab3_content,
                slide_show: tab3_images,
              },
            ],
          },
        };
      })
  );

  // Divide data into smaller chunks
  async function writeFiles() {
    const writePost = fsPromises.writeFile("server/transformed_posts.json", JSON.stringify(transformed_posts));
    const writePages = fsPromises.writeFile("server/transformed_pages.json", JSON.stringify(transformed_pages));
    const writeAttachments = fsPromises.writeFile("server/transformed_attachments.json", JSON.stringify(transformed_attachments));

    await Promise.all([writePost, writePages, writeAttachments]);
  }

  writeFiles().catch(console.error);
}

transformData();
