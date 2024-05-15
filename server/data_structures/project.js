export const getProject = () => {
  return {
    author: "user_id",
    publish_date: "date",
    name: "Project name",
    slug: "project-slug",
    category: "du-an-2024",
    donors: 
      {
        logos: ["logo1", "logo2"],
        description: "html/markdown description",
      },
    

    progress: [
      {
        title: "Ảnh hiện trạng",
        description: "progress description",
        images: ["progress image"],
      },
      {
        title: "Ảnh hoàn thiện",
        description: "progress description",
        images: ["progress image"],
      },
    ],
    content: {
      description: "Project description",
      tabs: [
        {
          name: "Hoàn cảnh",
          photos: [],
          htmlContent: "<h4>NHP</h4>\r\n<p>Hoàn cảnh: </p>\r\n<p> </p>",
          embeded_url: "https://www.youtube.com/embed/1",
          slide_show: [{
            image: "image1",
            caption: "caption1",
          }, {
            image: "image2",
            caption: "caption2",
          }, {
            image: "image3",
            caption: "caption3",
          }],
        },
        {
          name: "Hoàn cảnh",
          photos: [],
          htmlContent: "<h4>NHP</h4>\r\n<p>Hoàn cảnh: </p>\r\n<p> </p>",
          embeded_url: "https://www.youtube.com/embed/1",
          slide_show: [],
        },
        {
          name: "Hoàn cảnh",
          photos: [],
          htmlContent: "<h4>NHP</h4>\r\n<p>Hoàn cảnh: </p>\r\n<p> </p>",
          embeded_url: "https://www.youtube.com/embed/1",
          slide_show: [],
        },
      ],
    },
  };
};
