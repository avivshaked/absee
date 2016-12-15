const ABSee = require('../../dist/index');
const experimentsConfig = require('./config.json');

const Experiments = ABSee.Experiments;

const experiments = Experiments.defineByObject(experimentsConfig);

module.exports = experiments;
