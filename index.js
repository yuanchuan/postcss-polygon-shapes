const postcss = require('postcss');
const valueParser = require('postcss-value-parser');
const shapes = require('.lib//shapes');

const name = 'postcss-plugin-shapes';

module.exports = postcss.plugin(name, (opts = {}) => css => {
  const customShapes = opts.shapes || {};
  css.walkDecls(/clip-path$/, decl => {
    if (!/^shape\(/.test(decl.value)) return false;
    decl.value = valueParser(decl.value)
      .walk(node => {
        if (node.type !== 'function' && node.value !== 'shape') return;
        let idx = node.nodes.findIndex(n => n.type == 'word');
        if (idx == -1) return;
        let type = node.nodes[idx].value;
        let func = customShapes[type] || shapes[type];
        if (!func) return false;
        let params = node.nodes.slice(idx + 1)
          .filter(n => n.type == 'word')
          .map(n => Number(n.value));
        node.type = 'word';
        node.value = func.apply(null, params);
      }).toString();
  });
});
