const walk = require('tree-walk');
const debug = require('debug')('PRobot');
const Behavior = require('./behavior');
const actions = require('./actions');
const conditions = require('./conditions');
const logicalExpression = require('./logical-expression');
const attribute = require('./attribute');

module.exports = class Transformer {
  constructor(tree) {
    this.tree = tree;
  }

  transform() {
    return walk.reduce(this.tree, this.walk.bind(this));
  }

  walk(result, node) {
    if (this[node.type]) {
      return this[node.type](result, node);
    } else if (node.type) {
      throw new Error('Unknown node: ' + node.type);
    } else {
      return result || node;
    }
  }

  event(node) {
    return node;
  }

  attribute(node) {
    return context => attribute(context, node.name);
  }

  action(node) {
    return context => {
      if (!actions[node.name]) {
        throw new Error('Unknown action: ' + node.name);
      }
      debug('action: %s', node.name, node.value);
      return actions[node.name](context, node.value);
    };
  }

  behavior(node) {
    return new Behavior(node.events, node.conditions, node.actions);
  }

  condition(node) {
    return context => {
      if (!conditions[node.name]) {
        throw new Error('Unknown condition: ' + node.name);
      }
      debug('condition: %s', node.name, node.value);
      return conditions[node.name](context, node.value);
    };
  }

  LogicalExpression(node) {
    return context => {
      return logicalExpression(context, node.left, node.operator, node.right);
    };
  }
};