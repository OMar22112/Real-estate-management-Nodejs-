export const deleteProperty = async (req, res) => {
    try {
      const propertyId = req.params.propertyId;
  
      if (!propertyId) {
        return res.status(400).json({ error: 'Property ID is required.' });
      }
  
      // Delete images associated with the property from Firebase Storage
      const deleteImagesResult = await deleteImagesForProperty(propertyId);
  
      // If all images were successfully deleted, delete the property from the database
      if (deleteImagesResult.every(result => result.success)) {
        await new Promise((resolve, reject) => {
          db.query("DELETE FROM properties WHERE id = ?", [propertyId], (err, result) => {
            if (err) {
              console.error('Error deleting property from the database:', err);
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
  
        res.status(200).json({ message: 'Property and associated images deleted successfully', deleteImagesResult });
      } else {
        // If any image deletion fails, return an error response
        res.status(500).json({ error: 'Failed to delete one or more images associated with the property' });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  