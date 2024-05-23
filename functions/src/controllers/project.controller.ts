import { Response, Request } from "express";
import { firestore } from "../firebase";
import { FirebaseCollections } from "../constant";
export const getProjectstList = async (req: Request, res: Response) => {
  try {
    // const projectsRef = firestore.collection(FirebaseCollections.PROJECTS);
    // let projectsQuery;

    // const category = req.query.category as string;
    // if (category && category !== "tat-ca") {
    //   projectsQuery = projectsRef.where("category", "==", category);
    // }

    // const projectsSnapshot = await (projectsQuery ?? projectsRef)
    //   .orderBy('createdAt')
    //   .get();

    // const projects = projectsSnapshot.docs.map((doc) => ({
    //   id: doc.id,
    //   ...doc.data(),
    // }));

    // const totalCount = (
    //   (await (projectsQuery ?? projectsRef).get()) ?? { size: 0 }
    // ).size;
    res.set({
      "x-total-count": "10",
      "Access-Control-Expose-Headers": "x-total-count",
    });
    const _projects = [
      {
        author: "Author 1",
        publish_date: "1716301915178",
        name: "Project 1",
        slug: "project-1",
        category: "2024",
        donor: {
          logos: ["https://placehold.co/50x50/000000/FFF"],
          description: "Donor Description for Project 1",
        },
        progress: [
          {
            title: "Ảnh hiện trạng 1",
            description: "Progress Description for Project 1",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh quá trình  1",
            description: "Progress Description for Project 1",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh hoàn thành  1",
            description: "Progress Description for Project 1",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
        ],
        body: {
          description: "Body Description for Project 1",
          tabs: [
            {
              name: "Tab 1",
              content: {
                description: "Tab 1 Description for Project 1",
                htmlContent: "<p>Sample HTML content for Tab 1</p>",
                embeded_url: "https://www.youtube.com/embed/3JZ_D3ELwOQ",
              },
            },
            {
              name: "Tab 2",
              content: {
                htmlContent: "<p>Sample HTML content for Tab 2</p>",
                description: "Tab 2 Description for Project 1",
                slide_show: [
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 1 caption",
                  },
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 2 caption",
                  },
                ],
              },
            },
          ],
        },
      },
      {
        author: "Author 2",
        publish_date: "1716301915178",
        name: "Project 2",
        slug: "project-2",
        category: "2024",
        donor: {
          logos: ["https://placehold.co/50x50/000000/FFF"],
          description: "Donor Description for Project 2",
        },
        progress: [
          {
            title: "Ảnh hiện trạng 2",
            description: "Progress Description for Project 2",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh quá trình  2",
            description: "Progress Description for Project 2",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh hoàn thành  2",
            description: "Progress Description for Project 2",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
        ],
        body: {
          description: "Body Description for Project 2",
          tabs: [
            {
              name: "Tab 1",
              content: {
                description: "Tab 1 Description for Project 2",
                htmlContent: "<p>Sample HTML content for Tab 1</p>",
                embeded_url: "https://www.youtube.com/embed/3JZ_D3ELwOQ",
              },
            },
            {
              name: "Tab 2",
              content: {
                htmlContent: "<p>Sample HTML content for Tab 2</p>",
                description: "Tab 2 Description for Project 2",
                slide_show: [
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 1 caption",
                  },
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 2 caption",
                  },
                ],
              },
            },
          ],
        },
      },
      {
        author: "Author 3",
        publish_date: "1716301915178",
        name: "Project 3",
        slug: "project-3",
        category: "2024",
        donor: {
          logos: ["https://placehold.co/50x50/000000/FFF"],
          description: "Donor Description for Project 3",
        },
        progress: [
          {
            title: "Ảnh hiện trạng 3",
            description: "Progress Description for Project 3",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh quá trình  3",
            description: "Progress Description for Project 3",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh hoàn thành  3",
            description: "Progress Description for Project 3",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
        ],
        body: {
          description: "Body Description for Project 3",
          tabs: [
            {
              name: "Tab 1",
              content: {
                description: "Tab 1 Description for Project 3",
                htmlContent: "<p>Sample HTML content for Tab 1</p>",
                embeded_url: "https://www.youtube.com/embed/3JZ_D3ELwOQ",
              },
            },
            {
              name: "Tab 2",
              content: {
                htmlContent: "<p>Sample HTML content for Tab 2</p>",
                description: "Tab 2 Description for Project 3",
                slide_show: [
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 1 caption",
                  },
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 2 caption",
                  },
                ],
              },
            },
          ],
        },
      },
      {
        author: "Author 4",
        publish_date: "1716301915178",
        name: "Project 4",
        slug: "project-4",
        category: "2024",
        donor: {
          logos: ["https://placehold.co/50x50/000000/FFF"],
          description: "Donor Description for Project 4",
        },
        progress: [
          {
            title: "Ảnh hiện trạng 4",
            description: "Progress Description for Project 4",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh quá trình  4",
            description: "Progress Description for Project 4",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh hoàn thành  4",
            description: "Progress Description for Project 4",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
        ],
        body: {
          description: "Body Description for Project 4",
          tabs: [
            {
              name: "Tab 1",
              content: {
                description: "Tab 1 Description for Project 4",
                htmlContent: "<p>Sample HTML content for Tab 1</p>",
                embeded_url: "https://www.youtube.com/embed/3JZ_D3ELwOQ",
              },
            },
            {
              name: "Tab 2",
              content: {
                htmlContent: "<p>Sample HTML content for Tab 2</p>",
                description: "Tab 2 Description for Project 4",
                slide_show: [
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 1 caption",
                  },
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 2 caption",
                  },
                ],
              },
            },
          ],
        },
      },
      {
        author: "Author 5",
        publish_date: "1716301915178",
        name: "Project 5",
        slug: "project-5",
        category: "2024",
        donor: {
          logos: ["https://placehold.co/50x50/000000/FFF"],
          description: "Donor Description for Project 5",
        },
        progress: [
          {
            title: "Ảnh hiện trạng 5",
            description: "Progress Description for Project 5",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh quá trình  5",
            description: "Progress Description for Project 5",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh hoàn thành  5",
            description: "Progress Description for Project 5",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
        ],
        body: {
          description: "Body Description for Project 5",
          tabs: [
            {
              name: "Tab 1",
              content: {
                description: "Tab 1 Description for Project 5",
                htmlContent: "<p>Sample HTML content for Tab 1</p>",
                embeded_url: "https://www.youtube.com/embed/3JZ_D3ELwOQ",
              },
            },
            {
              name: "Tab 2",
              content: {
                htmlContent: "<p>Sample HTML content for Tab 2</p>",
                description: "Tab 2 Description for Project 5",
                slide_show: [
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 1 caption",
                  },
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 2 caption",
                  },
                ],
              },
            },
          ],
        },
      },
      {
        author: "Author 6",
        publish_date: "1716301915178",
        name: "Project 6",
        slug: "project-6",
        category: "2024",
        donor: {
          logos: ["https://placehold.co/50x50/000000/FFF"],
          description: "Donor Description for Project 6",
        },
        progress: [
          {
            title: "Ảnh hiện trạng 6",
            description: "Progress Description for Project 6",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh quá trình  6",
            description: "Progress Description for Project 6",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh hoàn thành  6",
            description: "Progress Description for Project 6",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
        ],
        body: {
          description: "Body Description for Project 6",
          tabs: [
            {
              name: "Tab 1",
              content: {
                description: "Tab 1 Description for Project 6",
                htmlContent: "<p>Sample HTML content for Tab 1</p>",
                embeded_url: "https://www.youtube.com/embed/3JZ_D3ELwOQ",
              },
            },
            {
              name: "Tab 2",
              content: {
                htmlContent: "<p>Sample HTML content for Tab 2</p>",
                description: "Tab 2 Description for Project 6",
                slide_show: [
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 1 caption",
                  },
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 2 caption",
                  },
                ],
              },
            },
          ],
        },
      },
      {
        author: "Author 7",
        publish_date: "1716301915178",
        name: "Project 7",
        slug: "project-7",
        category: "2024",
        donor: {
          logos: ["https://placehold.co/50x50/000000/FFF"],
          description: "Donor Description for Project 7",
        },
        progress: [
          {
            title: "Ảnh hiện trạng 7",
            description: "Progress Description for Project 7",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh quá trình  7",
            description: "Progress Description for Project 7",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh hoàn thành  7",
            description: "Progress Description for Project 7",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
        ],
        body: {
          description: "Body Description for Project 7",
          tabs: [
            {
              name: "Tab 1",
              content: {
                description: "Tab 1 Description for Project 7",
                htmlContent: "<p>Sample HTML content for Tab 1</p>",
                embeded_url: "https://www.youtube.com/embed/3JZ_D3ELwOQ",
              },
            },
            {
              name: "Tab 2",
              content: {
                htmlContent: "<p>Sample HTML content for Tab 2</p>",
                description: "Tab 2 Description for Project 7",
                slide_show: [
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 1 caption",
                  },
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 2 caption",
                  },
                ],
              },
            },
          ],
        },
      },
      {
        author: "Author 8",
        publish_date: "1716301915178",
        name: "Project 8",
        slug: "project-8",
        category: "2024",
        donor: {
          logos: ["https://placehold.co/50x50/000000/FFF"],
          description: "Donor Description for Project 8",
        },
        progress: [
          {
            title: "Ảnh hiện trạng 8",
            description: "Progress Description for Project 8",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh quá trình  8",
            description: "Progress Description for Project 8",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh hoàn thành  8",
            description: "Progress Description for Project 8",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
        ],
        body: {
          description: "Body Description for Project 8",
          tabs: [
            {
              name: "Tab 1",
              content: {
                description: "Tab 1 Description for Project 8",
                htmlContent: "<p>Sample HTML content for Tab 1</p>",
                embeded_url: "https://www.youtube.com/embed/3JZ_D3ELwOQ",
              },
            },
            {
              name: "Tab 2",
              content: {
                htmlContent: "<p>Sample HTML content for Tab 2</p>",
                description: "Tab 2 Description for Project 8",
                slide_show: [
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 1 caption",
                  },
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 2 caption",
                  },
                ],
              },
            },
          ],
        },
      },
      {
        author: "Author 9",
        publish_date: "1716301915178",
        name: "Project 9",
        slug: "project-9",
        category: "2024",
        donor: {
          logos: ["https://placehold.co/50x50/000000/FFF"],
          description: "Donor Description for Project 9",
        },
        progress: [
          {
            title: "Ảnh hiện trạng 9",
            description: "Progress Description for Project 9",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh quá trình  9",
            description: "Progress Description for Project 9",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh hoàn thành  9",
            description: "Progress Description for Project 9",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
        ],
        body: {
          description: "Body Description for Project 9",
          tabs: [
            {
              name: "Tab 1",
              content: {
                description: "Tab 1 Description for Project 9",
                htmlContent: "<p>Sample HTML content for Tab 1</p>",
                embeded_url: "https://www.youtube.com/embed/3JZ_D3ELwOQ",
              },
            },
            {
              name: "Tab 2",
              content: {
                htmlContent: "<p>Sample HTML content for Tab 2</p>",
                description: "Tab 2 Description for Project 9",
                slide_show: [
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 1 caption",
                  },
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 2 caption",
                  },
                ],
              },
            },
          ],
        },
      },
      {
        author: "Author 10",
        publish_date: "1716301915178",
        name: "Project 10",
        slug: "project-10",
        category: "2024",
        donor: {
          logos: ["https://placehold.co/50x50/000000/FFF"],
          description: "Donor Description for Project 10",
        },
        progress: [
          {
            title: "Ảnh hiện trạng 10",
            description: "Progress Description for Project 10",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh quá trình  10",
            description: "Progress Description for Project 10",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
          {
            title: "Ảnh hoàn thành  10",
            description: "Progress Description for Project 10",
            images: [
              "https://placehold.co/600x400/000000/FFF",
              "https://placehold.co/600x400/000000/FFF",
            ],
          },
        ],
        body: {
          description: "Body Description for Project 10",
          tabs: [
            {
              name: "Tab 1",
              content: {
                description: "Tab 1 Description for Project 10",
                htmlContent: "<p>Sample HTML content for Tab 1</p>",
                embeded_url: "https://www.youtube.com/embed/3JZ_D3ELwOQ",
              },
            },
            {
              name: "Tab 2",
              content: {
                htmlContent: "<p>Sample HTML content for Tab 2</p>",
                description: "Tab 2 Description for Project 10",
                slide_show: [
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 1 caption",
                  },
                  {
                    image: "https://placehold.co/600x400/orange/white",
                    caption: "Slide 2 caption",
                  },
                ],
              },
            },
          ],
        },
      },
    ];

    res.status(200).json(_projects.map((item) => ({ ...item, id: item.slug })));
  } catch (ee: any) {
    console.log(ee);
    res.status(500).json(ee);
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    return res.send({
      author: "Author 1",
      publish_date: "1716301915178355",
      name: "Project 1",
      slug: "project-1",
      category: "2024",
      donor: {
        logos: ["https://placehold.co/50x50/000000/FFF"],
        description: "Donor Description for Project 1",
      },
      progress: [
        {
          title: "Ảnh hiện trạng 1",
          description: "Progress Description for Project 1",
          images: [
            "https://placehold.co/600x400/000000/FFF",
            "https://placehold.co/600x400/000000/FFF",
          ],
        },
        {
          title: "Ảnh quá trình  1",
          description: "Progress Description for Project 1",
          images: [
            "https://placehold.co/600x400/000000/FFF",
            "https://placehold.co/600x400/000000/FFF",
          ],
        },
        {
          title: "Ảnh hoàn thành  1",
          description: "Progress Description for Project 1",
          images: [
            "https://placehold.co/600x400/000000/FFF",
            "https://placehold.co/600x400/000000/FFF",
          ],
        },
      ],
      body: {
        description: "Body Description for Project 1",
        tabs: [
          {
            name: "Tab 1",
            content: {
              description: "Tab 1 Description for Project 1",
              htmlContent: "<p>Sample HTML content for Tab 1</p>",
              embeded_url: "https://www.youtube.com/embed/3JZ_D3ELwOQ",
            },
          },
          {
            name: "Tab 2",
            content: {
              htmlContent: "<p>Sample HTML content for Tab 2</p>",
              description: "Tab 2 Description for Project 1",
              slide_show: [
                {
                  image: "https://placehold.co/600x400/orange/white",
                  caption: "Slide 1 caption",
                },
                {
                  image: "https://placehold.co/600x400/orange/white",
                  caption: "Slide 2 caption",
                },
              ],
            },
          },
        ],
      },
    });
    const projectId = req.params.id;
    const docRef = firestore
      .collection(FirebaseCollections.PROJECTS)
      .doc(projectId);
    const snapshot = await docRef.get();

    if (snapshot.exists) {
      const project = snapshot.data() as Sucmanh2000.Project;
      res.status(200).json(project);
    } else {
      res.status(404).json({ message: "Project not found" });
    }
  } catch (e: any) {
    res.status(500).json(e);
  }
};

export const getProjectBySlug = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.slug;
    const docRef = firestore
      .collection(FirebaseCollections.PROJECTS)
      .doc(projectId);
    const snapshot = await docRef.get();

    if (snapshot.exists) {
      const project = snapshot.data() as Sucmanh2000.Project;
      res.status(200).json(project);
    } else {
      res.status(404).json({ message: "Project not found" });
    }
  } catch (e: any) {
    res.status(500).json(e);
  }
};

export const addNewProject = async (req: Request, res: Response) => {
  try {
    const newProject = req.body as Sucmanh2000.Project;
    const docRef = firestore.collection(FirebaseCollections.PROJECTS).doc();
    await docRef.set({ ...newProject, createdAt: Date.now() });
    res.status(200).json({ ...newProject, createdAt: Date.now() });
  } catch (e: any) {
    res.status(500).json(e);
  }
};

export const updateProjectById = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;
    const updatedProject = req.body;
    const docRef = firestore
      .collection(FirebaseCollections.PROJECTS)
      .doc(projectId);
    await docRef.update(updatedProject);

    res.status(200).json({ message: "Project updated successfully" });
  } catch (e: any) {
    res.status(500).json(e);
  }
};

export const removeProjectById = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;
    const docRef = firestore
      .collection(FirebaseCollections.PROJECTS)
      .doc(projectId);
    await docRef.delete();
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (e: any) {
    console.log(e);
    res.status(500).json(e);
  }
};
