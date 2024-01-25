// Import necessary modules
import db from "../db.js";
import { getStorage, ref, listAll, deleteObject } from "firebase/storage";

// Controller function to delete a property and its associated images
export const deleteProperty = async (req, res) => {
    try {
      const propertyId = req.params.propertyId;
  
      await new Promise(async (resolve, reject) => {
        const storage = getStorage();
        const imagesRef = ref(storage, 'images/');
        const imagesList = await listAll(imagesRef);
        const propertyImages = imagesList.items.filter((image) =>
          image.name.startsWith(`images/${propertyId}_`)
        );
  
        const deleteImagesPromises = propertyImages.map(async (imageRef) => {
          await deleteObject(imageRef);
        });
  
        await Promise.all(deleteImagesPromises);
  
        // Log information for debugging
        console.log('Deleted images:', propertyImages.map((image) => image.name));
  
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
  
