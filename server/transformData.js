const fs = require("fs");

function transformData() {
  const jsonData = fs.readFileSync("server/original_posts.json", "utf8");
  const data = JSON.parse(jsonData).data;

  const transformedData = data
    .map((obj) => {
      const { ID, post_author, post_date_gmt, post_title, post_name, post_content, post_status, post_parent, guid, post_type, post_mime_type } = obj;

      if (["page", "post", "attachment", "nav_menu_item"].includes(obj.post_type)) {
        return {
          ID,
          post_author,
          post_date_gmt,
          post_title,
          post_name,
          post_content,
          post_status,
          post_parent,
          guid,
          post_type,
          post_mime_type,
        };
      } else {
        return null;
      }
    })
    .filter((obj) => obj);

  const json_obj = {
    type: "table",
    name: "posts",
    database: "websucmanh2000com",
    data: transformedData,
  };

  fs.writeFileSync("server/transformed_posts.json", JSON.stringify(json_obj));

  return transformedData;
}

transformData();
