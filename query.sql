CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    phone_no VARCHAR(15),
    image VARCHAR(1000), -- BYTEA is used for binary data (equivalent to LONGBLOB)
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  image_filename VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE properties (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  rooms INT NOT NULL,
  bedroom INT NOT NULL,
  bathroom INT NOT NULL,
  livings INT NOT NULL,
  space INT NOT NULL,
  has_garden BOOLEAN NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status BOOLEAN NOT NULL,
  admin_id INT,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);


import dotenv from "dotenv";

// dotenv.config({ path: "./.env" });
// import pg from 'pg';

// const { Pool } = pg;

// const pool = new Pool({
//   connectionString: process.env.POSTGRES_URL + "?sslmode=require",
// })
// pool.connect((err)=>{
//   if(err){
//     console.log(err);
//   }else{
//     console.log("Connect to PostgreSql");
//   }
  
// })

// export default pool;