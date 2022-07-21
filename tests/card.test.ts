import supertest from "supertest";
import app from "./../src/app.js";
import connection from "../database.js";

beforeEach(async () => {
    await connection.query(`DELETE FROM cards WHERE email='teste@gmail.com'`);
})

describe("Cards Routes Tests", () => {
    it("Activate Card Success", async () => {
        
    })
})