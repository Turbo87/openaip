const { xml2js } = require('xml-js');

function parse(str) {
  let xml = xml2js(str, {
    compact: true,
    ignoreComment: true,
  });

  let root = getChild(xml, 'OPENAIP');
  let dataFormat = getAttribute(root, 'DATAFORMAT');
  if (dataFormat !== '1.1') {
    throw new Error(`Unsupported DATAFORMAT: ${dataFormat}`);
  }

  let version = getAttribute(root, 'VERSION');

  let airspaces = findAirspaces(root);
  let hotspots = findHotspots(root);
  let navaids = findNavaids(root);
  let waypoints = findWaypoints(root);

  return { version, airspaces, hotspots, navaids, waypoints };
}

function findAirspaces(root) {
  return findCollection(root, 'AIRSPACES', 'ASP').map(readAirspace);
}

function readAirspace(node) {
  let category = getAttribute(node, 'CATEGORY');
  let version = getChildText(node, 'VERSION');
  let id = getChildText(node, 'ID');
  let country = getChildText(node, 'COUNTRY');
  let name = getChildText(node, 'NAME');

  let top = readAltitudeLimit(getChild(node, 'ALTLIMIT_TOP'));
  let bottom = readAltitudeLimit(getChild(node, 'ALTLIMIT_BOTTOM'));

  let _geometry = getChild(node, 'GEOMETRY');
  let _polygon = getChildText(_geometry, 'POLYGON');
  let geometry = parseCoordinates(_polygon);

  return { category, version, id, country, name, top, bottom, geometry };
}

function readAltitudeLimit(node) {
  let reference = getAttribute(node, 'REFERENCE');

  let _alt = getChild(node, 'ALT');
  let unit = getAttribute(_alt, 'UNIT');
  let value = parseFloat(_alt._text);

  return { reference, unit, value };
}

function findHotspots(root) {
  return [];
}

function findNavaids(root) {
  return [];
}

function findWaypoints(root) {
  return [];
}

function findCollection(root, name, childName) {
  let node = root[name];
  if (!node) {
    return [];
  }

  let children = node[childName];
  if (!children) {
    return [];
  }
  if (!Array.isArray(children)) {
    children = [children];
  }

  return children;
}

function getChild(parent, name) {
  let child = parent[name];
  if (child) {
    return child;
  } else {
    throw new Error(`Missing <${name}> element`);
  }
}

function getChildText(parent, name) {
  return getChild(parent, name)._text;
}

function getAttribute(element, name) {
  let attributes = element._attributes || {};
  if (name in attributes) {
    return attributes[name];
  } else {
    throw new Error(`Missing ${name} attribute`);
  }
}

function parseCoordinates(str) {
  return str.split(', ').map(it => it.split(' ').map(parseFloat));
}

module.exports = {
  parse,
};
