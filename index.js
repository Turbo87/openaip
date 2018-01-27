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
  return findCollection(root, 'HOTSPOTS', 'HOTSPOT').map(readHotspot);
}

function readHotspot(node) {
  let type = getAttribute(node, 'TYPE');
  let country = getChildText(node, 'COUNTRY');
  let name = getChildText(node, 'NAME');

  let _geolocation = getChild(node, 'GEOLOCATION');
  let _lat = parseFloat(getChildText(_geolocation, 'LAT'));
  let _lon = parseFloat(getChildText(_geolocation, 'LON'));
  let position = [_lon, _lat];
  let _elevation = getChild(_geolocation, 'ELEV');
  let elevation = {
    unit: getAttribute(_elevation, 'UNIT'),
    value: parseFloat(_elevation._text),
  };

  let reliability = getChildText(node, 'RELIABILITY');
  let occurrence = getChildText(node, 'OCCURRENCE');

  let conditions = findConditions(node);

  let _cats = findCollection(node, 'AIRCRAFTCATEGORIES', 'AIRCRAFTCATEGORY');
  let aircraftCategories = _cats.map(it => it._text);

  let _comment = node['COMMENT'];
  let comment = _comment ? _comment._text : null;

  return {
    type,
    country,
    name,
    position,
    elevation,
    reliability,
    occurrence,
    conditions,
    aircraftCategories,
    comment,
  };
}

function findConditions(node) {
  let _conditions = node['CONDITIONS'];
  if (!_conditions) {
    return null;
  }

  let type = getAttribute(_conditions, 'TYPE');
  let _times = findCollection(_conditions, 'TIMEOFDAY', 'TIME');
  let times = _times.map(it => it._text);
  let _wind = findCollection(_conditions, 'WIND', 'DIRECTION');
  let wind = _wind.map(it => parseInt(it._text, 10));

  return { type, times, wind };
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
