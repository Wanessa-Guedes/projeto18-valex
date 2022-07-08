/* import dotenv from "dotenv";
import pg from "pg";
dotenv.config();

const { Pool } = pg;
export const connection = new Pool({
  connectionString: process.env.DATABASE_URL,
}); */

import pg, {ClientConfig} from "pg";
import dotenv from "dotenv";

dotenv.config();

const {Pool} = pg;

const connectionString = process.env.DATABASE_URL;
const databaseConfig: ClientConfig = { connectionString }

if(process.env.MODE === "PROD"){
    databaseConfig.ssl = {
        rejectUnauthorized: false
    }
}

const connection = new Pool(databaseConfig);

export default connection;
