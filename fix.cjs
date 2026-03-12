const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'App.jsx');
let c = fs.readFileSync(file, 'utf8');

let count = 0;

// Fix .join("\n") where \n is a literal newline
c = c.replace(/\.join\("(\r?\n)"\)/g, () => { count++; return '.join("\\n")'; });

// Fix {"\n"} where \n is a literal newline
c = c.replace(/\{"(\r?\n)"\}/g, () => { count++; return '{"\\n"}'; });

// Fix multi-line CodeBlock code= strings
c = c.replace(
  /<CodeBlock code=\{"\/\/ Auto-migrations on startup(\r?\n)if \(app\.Environment\.IsDevelopment\(\)\)(\r?\n)  db\.Database\.Migrate\(\);"\} \/>/g,
  () => { count++; return '<CodeBlock code={"// Auto-migrations on startup\\nif (app.Environment.IsDevelopment())\\n  db.Database.Migrate();"} />'; }
);

fs.writeFileSync(file, c, 'utf8');
console.log('Replacements made:', count);
