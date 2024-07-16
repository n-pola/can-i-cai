import { readFileSync } from 'fs';
import path from 'path';
import Ajv from 'ajv';
import { globSync } from 'glob';
import { verifyFiles } from './utils/verifyFiles';

const ajv = new Ajv();

// load schemas from file
const componentSchema = readFileSync(
  path.join(__dirname, 'schemas', 'component.schema.json'),
  'utf8',
);
const categorySchema = readFileSync(
  path.join(__dirname, 'schemas', 'category.schema.json'),
  'utf8',
);

// compile schema
const validateComponent = ajv.compile(JSON.parse(componentSchema));
const validateCategory = ajv.compile(JSON.parse(categorySchema));

// Get all files to check
const base = path.join(__dirname, '../../data/categories');
const componentFiles = globSync(`${base}/*/*/*.md`);
const categoryFiles = globSync(`${base}/*/index.md`);

const componentIds = new Set<string>();
const categoryIds = new Set<string>();

const validateData = async () => {
  console.log('\nValidating component files...');
  const componentValidationFailed = await verifyFiles(
    componentFiles,
    validateComponent,
    componentIds,
  );

  console.log('\nValidating category files...');
  const categoryValidationFailed = await verifyFiles(
    categoryFiles,
    validateCategory,
    categoryIds,
  );

  return componentValidationFailed || categoryValidationFailed;
};

validateData().then((result) => {
  if (result) {
    process.exit(1);
  } else {
    console.log('All files are valid');
    process.exit(0);
  }
});
