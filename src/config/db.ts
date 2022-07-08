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