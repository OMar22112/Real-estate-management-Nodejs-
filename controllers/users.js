import db from "../db.js";

export const showAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    const dataQuery = `SELECT * FROM users LIMIT ${limit} OFFSET ${offset}`;
    const countQuery = `SELECT COUNT(*) as total FROM users`;

    const [dataResult, countResult] = await Promise.all([
      new Promise((resolve, reject) => {
        db.query(dataQuery, (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(countQuery, (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      }),
    ]);

    const totalUsers = countResult.length > 0 ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalUsers / limit);

    // Map through the rows and modify the image field
    const sanitizedRows = dataResult.map((user) => {
      return {
        ...user,
        image: user.image ? getImageUrl(req, user.image) : null,
      };
    });

    res.json({
      users: sanitizedRows,
      pageInfo: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalUsers,
        totalPages,
      },
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


// -- Drop the existing "users" table if it exists
// DROP TABLE IF EXISTS users;

// -- Create the new "users" table
// CREATE TABLE users (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     username VARCHAR(255),
//     email VARCHAR(255),
//     password VARCHAR(255),
//     phone_no VARCHAR(15),
//     image LONGBLOB,
//     description TEXT,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );
