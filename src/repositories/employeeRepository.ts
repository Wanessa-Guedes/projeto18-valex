import connection from "./../../database.js";

import { Company } from "./companyRepository.js";

export interface Employee {
  id: number;
  fullName: string;
  cpf: string;
  email: string;
  companyId: number;
}

export async function findById(id: number) {
  const result = await connection.query<Employee, [number]>(
    "SELECT * FROM employees WHERE id=$1",
    [id]
  );

  return result.rows[0];
}

// identificar se funcionário pertence a tal cia
export async function findEmployeeByCiaApiKey(apiKey: string) {
  const result = await connection.query<Company, [string]>(
    `SELECT * FROM employees
    JOIN companies ON companies.id  = employees."companyId"
    WHERE companies."apiKey"=$1`, [apiKey]
  );

  return result.rows;
}
