import { readFileSync } from 'fs';
import path from 'path';
import Ajv from 'ajv';
import fm from 'front-matter';
import { globSync } from 'glob';

const ajv = new Ajv();

// load schema from file
const schema = readFileSync(
  path.join(__dirname, 'schemas', 'component.json'),
  'utf8',
);

// compile schema
const validate = ajv.compile(JSON.parse(schema));

const base = path.join(__dirname, '../../data/categories');
const componentFiles = globSync(`${base}/*/*/*.md`);

let validationFailed = false;

componentFiles.forEach((file) => {
  const data = readFileSync(file, 'utf8');
  const { attributes } = fm(data);
  const valid = validate(attributes);
  const name = path.basename(file);

  if (valid) {
    console.log(`✅ ${name}`);
  } else {
    console.log(`❌ ${name}`);
    console.log(validate.errors);
    validationFailed = true;
  }
});

if (validationFailed) {
  process.exit(1);
} else {
  console.log('All files are valid');
  process.exit(0);
}
