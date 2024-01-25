// Import necessary modules
import db from "../db.js";
import { getStorage, ref, list, deleteObject } from "firebase/storage";

// Controller function to delete a property and its associated images
export const deleteProperty = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    // Use async/await with the db.query function to delete the property and its images
    await new Promise(async (resolve, reject) => {
      // Delete images associated with the property from Firebase Storage
      const storage = getStorage();
      const imagesRef = ref(storage, 'images/');
      
      // List all items in the 'images/' path
      const imagesSnapshot = await list(imagesRef);
      const imagesList = imagesSnapshot.items;

      // Filter images associated with the property
      const propertyImages = imagesList.filter((image) => image.name.startsWith(`images/${propertyId}_`));

      // Delete each image
      const deleteImagesPromises = propertyImages.map(async (imageRef) => {
        await deleteObject(imageRef);
      });

      await Promise.all(deleteImagesPromises);

      // Delete the property from the database
      db.query("DELETE FROM properties WHERE id = ?", [propertyId], (error, results) => {
        if (error) {
          console.error('Error deleting property:', error);
          reject(error);
        } else {
          console.log('Property deleted successfully');
          resolve(results);
        }
      });
    });

    res.json({ message: "Property and associated images deleted successfully" });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
