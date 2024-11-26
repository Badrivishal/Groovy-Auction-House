import mysql from 'mysql';

export const handler = async (event) => {
    const pool = mysql.createPool({
        host: "groovy-auction-house-database.cfa2g4o42i87.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "8NpElCb61lk8lqVRaYAu",
        database: "auction_house"
    });

    let response = {}

    const dbError = {
        status: 402,
        message: "DB Error"
    }

    const reviewPurchases = (buyerID) => {
       
            
    };

    try {
        await reviewPurchases(buyerID);
        return response;
    } catch (error) {
        return response;
    } finally {
        pool.end();
    }
};
