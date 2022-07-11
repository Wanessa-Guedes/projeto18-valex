import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const {Pool} = pg;

const devMode = {connectionString: process.env.DEV_DATABASE_URL};
const prodMode = {connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false}};

const connection = new Pool(process.env.MODE === "PROD" ? prodMode : devMode) ;

export default connection;
