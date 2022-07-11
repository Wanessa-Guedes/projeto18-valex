/* import dotenv from "dotenv";
import pg from "pg";
dotenv.config();

const { Pool } = pg;
export const connection = new Pool({
  connectionString: process.env.DATABASE_URL,
}); */

import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const {Pool} = pg;

const devMode = {connectionString: process.env.DEV_DATABASE_URL};
const prodMode = {connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false}};

const connection = new Pool(process.env.MODE === "PROD" ? prodMode : devMode) ;

export default connection;
