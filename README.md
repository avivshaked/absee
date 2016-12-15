## ABSee

A small library for creating AB experiment constructs. 

With this library you set up your experiment configuration, set variant providers and conditions, set provider and condition contexts, and get back variants state.

Table of contents
-----------------
* [Installation](#installation)
* [Tests](#tests)
* [Getting started](#getting-started)
    * [Creating experiments construct with explicit chaining](creating-experiments-construct-with-explicit-chaining)
    * [Creating experiments construct with config object](creating-experiments-construct-with-config-object)
* [License](#License)


## Installation

To install run: 

`npm install absee`

## Tests

The tests cover most, if not all, of the methods in the classes.

To run the tests: 

`npm run test`

## Getting Started

The first step would be to create experiments construct. Experiments construct would be a list of experiments.
Each experiment should have a name, can have a configuration, and should have variants.
Each variant should have a name, unique in its experiment, can have a state, and can have a config.

### Creating experiments construct with Explicit chaining
There are two ways to create experiments construct. The first way is with explicit chaining.
Create an instance of Experiments, instances of Experiment, and instances of Variants.

```js
const experiments = Experiments.define()
    .addExperiment(
        Experiment.define('First experiment')
            .addVariant(
                Variant.define('control', {
                    prop1: true,
                    prop2: true,
                })
            )
            .addVariant(
                Variant.define('variantA', {
                    prop1: false,
                    prop2: true,
                })
            )
            .addVariant(
                Variant.define('variantB', {
                    prop1: true,
                    prop2: false,
                })
            )
    )
```

You can find an example in 'examples/creating-constructs-explicit-chaining/index.js'

### Creating experiments construct with Explicit chaining
The second way to create an experiments construct is with a config object, or a config file.
The object can have a config property, and must have an experiments property.
Experiments property is an array of objects, where each object is an experiment definition object.
```js
const experimentsConfig = {
    "config": {
      "some": "config"
    },
    "experiments": [
      {
        "name": "First Experiment",
        "variants": [
          {
            "name": "control",
            "state": {
              "prop1": "show",
              "prop2": "hide"
            }
          },
          {
            "name": "variantA",
            "state": {
              "prop1": "hide",
              "prop2": "show"
            }
          },
          {
            "name": "variantB",
            "state": {
              "prop1": "show",
              "prop2": "show"
            }
          }
        ]
      }
    ]
  };

const experiments = Experiments.defineByObject(experimentsConfig);

```

You can find an example in 'examples/creating-constructs-config-object/index.js'

## License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions: