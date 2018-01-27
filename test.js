const fs = require('fs');
const path = require('path');

const openaip = require('./index.js');

describe('fixtures', () => {
  let fixtures = fs.readdirSync(path.join(__dirname, 'fixtures'));

  for (let fixture of fixtures) {
    test(fixture, () => {
      let filePath = path.join(__dirname, 'fixtures', fixture);
      let content = fs.readFileSync(filePath, 'utf8');
      let result = openaip.parse(content);

      expect(result).toMatchSnapshot();
    });
  }
});
