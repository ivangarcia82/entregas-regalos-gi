
import * as XLSX from 'xlsx'
import * as path from 'path'
import * as fs from 'fs'

const excelPath = path.join(process.cwd(), 'entregasv2.xlsx');
const jsonPath = path.join(process.cwd(), 'src', 'data', 'prod-seed.json');
const dir = path.dirname(jsonPath);

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
console.log(`Converted ${data.length} rows to ${jsonPath}`);
