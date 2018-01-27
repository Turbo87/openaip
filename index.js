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
  return [];
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

function getChild(parent, name) {
  let child = parent[name];
  if (child) {
    return child;
  } else {
    throw new Error(`Missing <${name}> element`);
  }
}

function getAttribute(element, name) {
  let attributes = element._attributes || {};
  if (name in attributes) {
    return attributes[name];
  } else {
    throw new Error(`Missing ${name} attribute`);
  }
}

module.exports = {
  parse,
};
