const fs = require("fs");
const { bucket } = require("../firebase");

async function transformData() {
  const jsonData = fs.readFileSync("server/original_db.json", "utf8");
  const data = JSON.parse(jsonData).data;

  const transformed_posts = await Promise.all(
    data
      .filter((obj) => obj.post_type === "post" && obj.post_status === "publish")
      .map(async (obj) => {
        const { ID, post_author, post_date_gmt, post_title, post_name, post_content } = obj;

        let category;
        switch (true) {
          case post_name.includes("cap-nhat-tien-do"):
            category = "tien-do-xay-dung";
            break;
          case post_name.includes("tai-chinh"):
            category = "bao-cao-tai-chinh";
            break;
          default:
            category = "tin-tuc";
        }

        function extractEmbedUrl(post_content) {
          const embedRegex = /\[embed\](.*?)\[\/embed\]/;
          const match = post_content.match(embedRegex);
          const embedded_url = match ? match[1] : null;

          // Remove the embed tag from the post_content
          let contentWithoutEmbeddedUrl;
          if (embedded_url) {
            contentWithoutEmbeddedUrl = post_content.replace(embedRegex, "");
          }

          return { embedded_url, contentWithoutEmbeddedUrl };
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
            caption = caption.replace(/<\/?[^>]+(>|$)/g, "").trim(); // Remove HTML tags
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
          for (let i = images.length - 2; i >= 0; i--) {
            if (!images[i].caption) {
              images[i].caption = images[i + 1].caption;
            }
          }

          // After extracting the images, get the download URLs
          const imagePromises = images.map(async (image) => {
            const file = bucket.file(image.image);
            const url = await file.getSignedUrl({
              action: "read",
              expires: "03-09-2491",
            });

            return { image: url[0], caption: image.caption };
          });

          const imageObjects = await Promise.all(imagePromises);

          // Only keep content up to the start of the first image
          let contentWithoutImages = firstImageStartIndex !== -1 ? htmlString.substring(0, firstImageStartIndex) : htmlString;

          return { images: imageObjects, contentWithoutImages };
        }

        const { embedded_url, contentWithoutEmbeddedUrl } = extractEmbedUrl(post_content);
        const { images, contentWithoutImages } = await extractImagesAndContent(embedded_url ? contentWithoutEmbeddedUrl : post_content);

        return {
          id: ID,
          author: post_author ? "Hoàng Hoa Trung" : "Admin",
          publish_date: post_date_gmt,
          name: post_title,
          slug: post_name,
          category: category,
          content: {
            tabs: [
              {
                name: "Main content",
                description: contentWithoutImages,
                embedded_url: embedded_url,
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

  const transformed_pages = data
    .filter((obj) => obj.post_type === "page" && obj.post_status === "publish")
    .map((obj) => {
      const { ID, post_author, post_date_gmt, post_title, post_name, post_content, post_parent } = obj;
      let donor_content, tab1_content, tab2_content, tab3_content;
      let donor_images, tab1_images, tab2_images, tab3_images;
      let description, category, embedded_url;
      let before = [],
        in_progress = [],
        after = [];

      function extractImages(content) {
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
        return images;
      }

      function extractContent() {
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
        donor_images = extractImages(donor_content);
        tab1_images = extractImages(tab1_content);
        tab2_images = extractImages(tab2_content);
        tab3_images = extractImages(tab3_content);

        if (donor_content) {
          const firstColMatch = donor_content.match(/\[row.*?\[col.*?\](.*?)\[\/col\]/is);
          donor_content = firstColMatch ? firstColMatch[1] : null;
        }
        if (tab1_content) {
          tab1_content = tab1_content.replace(/<img[^>]*>/g, "").replace(/\[(ux_slider|ux_image)\].*?\[\/(ux_slider|ux_image)\]/gs, "");
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
        }
        if (tab3_content) {
          tab3_content = tab3_content.replace(/<img[^>]*>/g, "").replace(/\[(ux_slider|ux_image)\].*?\[\/(ux_slider|ux_image)\]/gs, "");
          tab3_content = tab3_content.replace(/\[(row_inner|col_inner)[^\]]*\]\s*\[\/(row_inner|col_inner)\]/gs, "");
        }
        if (description) {
          description = description.replace(/\[ux_image_box[^\]]*\]/g, "").replace(/\[\/ux_image_box\]/g, "");
        }

        [before, in_progress, after] = imageArrays;
        [before, in_progress, after] = [before, in_progress, after].map((array) =>
          array.map((item) => {
            const imageId = item
              .replace(/" height="[^"]*/g, "")
              .replace(/" width="[^"]*/g, "")
              .replace(/" image_size="[^"]*/g, "");
            const imageObject = transformed_attachments.find((attachment) => attachment.id === imageId);
            const imageUrl = imageObject ? imageObject.url.replace(/http(s)?:\/\/web.sucmanh2000.com\/wp-content\//, "") : null;
            if (!imageUrl) console.log("!imageUrl3", imageId);
            return imageUrl;
          })
        );

        tab1_images = tab1_images.map((image) => ({ image, caption: "" }));
        tab2_images = tab2_images.map((image) => ({ image, caption: "" }));
        tab3_images = tab3_images.map((image) => ({ image, caption: "" }));
      }

      function extractCategory() {
        if (post_parent && post_parent !== "0") {
          const parentPost = data.filter((obj) => obj.post_type === "page" && obj.post_status === "publish").find((page) => page.ID === post_parent);
          if (parentPost) {
            category = parentPost.post_name.replace("cac-", "");
          }
        }
      }

      extractCategory();
      extractContent();

      return {
        id: ID,
        author: post_author ? "Admin" : "N/A",
        publish_date: post_date_gmt,
        name: post_title,
        description: description,
        slug: post_name,
        category: category,
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
    });

  // Divide data into smaller chunks
  fs.writeFileSync("server/transformed_posts.json", JSON.stringify(transformed_posts));
  // fs.writeFileSync("server/transformed_pages.json", JSON.stringify(transformed_pages));
  // fs.writeFileSync("server/transformed_attachments.json", JSON.stringify(transformed_attachments));
}

transformData();
