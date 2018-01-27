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

it('throws if <OPENAIP> is missing', () => {
  expect(() => openaip.parse('')).toThrow('Missing <OPENAIP> element');
});

it('throws if DATAFORMAT is missing', () => {
  const xml = `<OPENAIP></OPENAIP>`;

  expect(() => openaip.parse(xml)).toThrow('Missing DATAFORMAT attribute');
});

it('throws if DATAFORMAT is unsupported', () => {
  const xml = `<OPENAIP DATAFORMAT="42"></OPENAIP>`;

  expect(() => openaip.parse(xml)).toThrow('Unsupported DATAFORMAT: 42');
});

it('throws if VERSION is missing', () => {
  const xml = `<OPENAIP DATAFORMAT="1.1"></OPENAIP>`;

  expect(() => openaip.parse(xml)).toThrow('Missing VERSION attribute');
});

it('returns empty airspace list if <ASP> is missing', () => {
  const xml = `
    <OPENAIP DATAFORMAT="1.1" VERSION="42">
      <AIRSPACES></AIRSPACES>
    </OPENAIP>
  `;

  expect(openaip.parse(xml).airspaces).toEqual([]);
});
