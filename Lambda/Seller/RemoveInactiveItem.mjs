import mysql from 'mysql';

export const handler = async (event) => {
  const pool = mysql.createPool({
    host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "8NpElCb61lk8lqVRaYAu",
    database: "auction_house",
  });

  const dbError = {
    status: 402,
    message: "DB Error",
  };

  const itemNotFound = {
    status: 404,
    message: "Item not found or does not meet criteria for removal",
  };

  const removeSuccess = {
    status: 200,
    message: "Item removed successfully",
  };

  let response = {};

  const executeQuery = (query, params) => {
    return new Promise((resolve, reject) => {
      pool.query(query, params, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  };

  const RemoveItem = async (itemID) => {
    try {
      const query = "DELETE FROM auction_house.Item WHERE ItemID = ? AND IsPublished = false AND (IsComplete = true OR IsArchived = true)";
      const results = await executeQuery(query, [itemID]);
      const affectedRows = results.affectedRows;

      if (affectedRows === 0) {
        response = { status: itemNotFound.status, error: itemNotFound };
      } else {
        response = {
          status: removeSuccess.status,
          success: {
            message: removeSuccess.message,
            removedItemID: itemID,
          },
        };
      }
    } catch (error) {
      console.error("DB Error during item removal:", error);
      response = { error: dbError };
      throw error;
    }
  };

  const { itemID } = event;

  try {
    if (!itemID) {
      throw { status: 400, message: "ItemID is required for this operation" };
    }
    await RemoveItem(itemID);
    return response;
  } catch (error) {
    console.error("Error in RemoveSpecificItem function:", error);
    return error;
  } finally {
    pool.end();
  }
};
