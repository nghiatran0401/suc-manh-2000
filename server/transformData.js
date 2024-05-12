const fs = require("fs");

function transformData() {
  const jsonData = fs.readFileSync("original_db.json", "utf8");
  const data = JSON.parse(jsonData).data;

  const transformed_posts = data
    .filter((obj) => obj.post_type === "post" && obj.post_status === "publish")
    .map((obj) => {
      const { ID, post_author, post_date_gmt, post_title, post_name, post_content, post_status, post_parent, guid, post_type, post_mime_type } = obj;

      return {
        id: ID,
        author: post_author ? "Admin" : "N/A",
        publish_date: post_date_gmt,
        title: post_title,
        slug: post_name,
        // post_content: post_content,
        // main_info: {
        //   intro: { content: intro_content, images: intro_images },
        //   tab1: { content: tab1_content, images: tab1_images },
        //   tab2: { content: tab2_content, images: tab2_images },
        //   tab3: { content: tab3_content, images: tab3_images },
        // },
        // sub_info: sub_info,
        // construction_images: {
        //   before: before,
        //   in_progress: in_progress,
        //   after: after,
        // },
        post_type,
        // post_status,
        // post_parent,
        // guid,
        // post_mime_type,
      };
    });

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
      const { ID, post_author, post_date_gmt, post_title, post_name, post_content, post_status, post_parent, guid, post_type, post_mime_type } = obj;
      let intro_content, tab1_content, tab2_content, tab3_content;
      let intro_images, tab1_images, tab2_images, tab3_images;
      let sub_info;
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

      const patterns = [
        /\[col[^]*?Thông tin nhà tài trợ:([\s\S]*?)\[\/col\]/,
        /\[tab title="Hoàn cảnh"\](.*?)\[\/tab\]/s,
        /\[tab title="Nhà hảo tâm"\](.*?)\[\/tab\]/s,
        /\[tab title="Mô hình xây"\](.*?)\[\/tab\]/s,
        /\[ux_image_box[^\]]*\](.*?)\[\/ux_image_box\]/s,
        /\[title text="ẢNH HIỆN TRẠNG"(.*?)\[\/col\]/gis,
        /\[title text="ẢNH TIẾN ĐỘ"(.*?)\[\/col\]/gis,
        /\[title text="ẢNH HOÀN THIỆN"(.*?)\[\/col\]/gis,
      ];
      const imgIdPattern = /\[ux_image id="(.*?)"\]/g;
      const results = [intro_content, tab1_content, tab2_content, tab3_content, sub_info];
      const imageArrays = [before, in_progress, after];

      patterns.forEach((pattern, index) => {
        const match = post_content.toString().match(pattern);
        if (index < 5) {
          results[index] = match ? match[1].replace(/\[ux_html\]|\[\/ux_html\]/g, "").trim() : null;
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

      [intro_content, tab1_content, tab2_content, tab3_content, sub_info] = results;
      intro_images = extractImages(intro_content);
      tab1_images = extractImages(tab1_content);
      tab2_images = extractImages(tab2_content);
      tab3_images = extractImages(tab3_content);
      if (tab1_content) tab1_content = tab1_content.replace(/<img[^>]*>/g, "").replace(/\[ux_slider\].*?\[\/ux_slider\]/gs, "");
      if (tab2_content) tab2_content = tab2_content.replace(/<img[^>]*>/g, "").replace(/\[ux_slider\].*?\[\/ux_slider\]/gs, "");
      if (tab3_content) tab3_content = tab3_content.replace(/<img[^>]*>/g, "").replace(/\[ux_slider\].*?\[\/ux_slider\]/gs, "");

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

      return {
        id: ID,
        author: post_author ? "Admin" : "N/A",
        publish_date: post_date_gmt,
        title: post_title,
        slug: post_name,
        // post_content: post_content,
        main_info: {
          intro: { content: intro_content, images: intro_images },
          tab1: { content: tab1_content, images: tab1_images },
          tab2: { content: tab2_content, images: tab2_images },
          tab3: { content: tab3_content, images: tab3_images },
        },
        sub_info: sub_info,
        construction_images: {
          before: before,
          in_progress: in_progress,
          after: after,
        },
        // post_type,
        // post_status,
        // post_parent,
        // guid,
        // post_mime_type,
      };
    });

  // Divide data into smaller chunks
  // fs.writeFileSync("server/transformed_posts.json", JSON.stringify(transformed_posts));
  fs.writeFileSync("transformed_pages.json", JSON.stringify(transformed_pages));
  fs.writeFileSync("transformed_attachments.json", JSON.stringify(transformed_attachments));
}

transformData();
