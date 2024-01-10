import db from "../db.js";

export const newestUsers = async (req, res) => {
  try {
    await db.query("SELECT * FROM users ORDER BY id DESC", (err, rows) => {
      if (!err) {
        // Map through the rows and modify the image field
        const sanitizedRows = rows.map((user) => {
          return {
            ...user,
            image: user.image ? getImageUrl(req, user.image) : null,
          };
        });

        //console.log(sanitizedRows);
        res.json(sanitizedRows);
      } else {
        console.log(err);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Function to get the image URL based on the image data
const getImageUrl = (req, imageData) => {
  
  const imageUrl = generateImageUrl(req, imageData);

  return imageUrl;
};

const generateImageUrl = (req, imageData) => {
  return `${req.protocol}://${req.get('host')}/uploads/${imageData}`;
};


