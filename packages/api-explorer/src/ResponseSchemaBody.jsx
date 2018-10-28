const React = require('react');
const PropTypes = require('prop-types');

const marked = require('../../markdown/index');
const findSchemaDefinition = require('./lib/find-schema-definition');

const flatten = list => list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
const getName = (parent, prop) => {
  if (!parent) return prop;
  if (parent[parent.length - 1] === ' ') return `${parent}${prop}`;

  return `${parent}.${prop}`;
};
function flattenResponseSchema(obj, oas, parent = '', level = 0) {
  const prefix = new Array(level + 2).join('| ');
  if (level > 2) {
    return [];
  }

  if (obj.type === 'array' && obj.items && obj.items.$ref) {
    const value = findSchemaDefinition(obj.items.$ref, oas);
    return flatten(flattenResponseSchema(value, oas));
  }

  if (obj && !obj.properties) {
    return [];
  }
  const arrayOfObjects = Object.keys(obj.properties).map(prop => {
    let value = obj.properties[prop];
    const array = [];
    if (value.type === 'object') {
      array.push(flattenResponseSchema(value, oas, getName(parent, prop), level + 1));
    }

    if (value.$ref) {
      value = findSchemaDefinition(value.$ref, oas);
      array.push(flattenResponseSchema(value, oas, getName(parent, prop), level + 1));
    }

    if (value.type === 'array' && value.items && value.items.$ref) {
      array.push({
        name: getName(parent, prop),
        type: `array of objects`,
        description: value.description,
      });

      value = findSchemaDefinition(value.items.$ref, oas);
      array.push(flattenResponseSchema(value, oas, `${prefix}`, level + 1));
      return array;
    }

    if (
      value.type === 'array' &&
      value.items &&
      value.items.type &&
      value.items.type !== 'object'
    ) {
      array.push({
        name: getName(parent, prop),
        type: `array of ${value.items.type}`,
        description: value.description,
      });

      return array;
    }

    array.unshift({
      name: getName(parent, prop),
      type: value.type,
      description: value.description,
    });
    return array;
  });
  return flatten(arrayOfObjects);
}

function ResponseSchemaBody({ schema, oas }) {
  const rows = flattenResponseSchema(schema, oas).map(row => (
    <tr key={row.name}>
      <th>{row.name}</th>
      <td>
        {row.type}
        {row.description && marked(row.description)}
      </td>
    </tr>
  ));

  return (
    <table>
      <tbody>{rows}</tbody>
    </table>
  );
}

module.exports = ResponseSchemaBody;

ResponseSchemaBody.propTypes = {
  schema: PropTypes.shape({}).isRequired,
  oas: PropTypes.shape({}).isRequired,
};

module.exports.flattenResponseSchema = flattenResponseSchema;
module.exports.flatten = flatten;
