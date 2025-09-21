import mongoose from "mongoose";

export const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "JOB"
    })
    .then(() => {
      console.log("Connected to MongoDB database.");
    })
    .catch((err) => {
      console.log(`Some Error occured. ${err}`);
    });
};

