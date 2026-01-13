
import * as XLSX from 'xlsx'
import * as path from 'path'
import * as fs from 'fs'

const excelPath = path.join(process.cwd(), 'entregasarmando.xlsx');
const jsonPath = path.join(process.cwd(), 'src', 'data', 'armando-seed.json');

const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

console.log('First row example:', data[0]);

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
console.log(`Converted ${data.length} rows to ${jsonPath}`);
