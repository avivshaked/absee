module.exports = {
    "extends": [
        "airbnb-base",
        "plugin:ava/recommended"
    ],
    "parser": "babel-eslint",
    "plugins": [
        "ava"
    ],
    "env": {
        "browser": true,
        "node": true,
        "mocha": true,
    },
    "ecmaFeatures": {
        "es6": true,
        "classes": true
    },
    "rules": {
        "comma-dangle": [1, "always-multiline"],
        "indent": [2, 4, { "SwitchCase": 1 }],
        "quote-props": [0],
        "spaced-comment": [0],
        "no-underscore-dangle": 0,
        "max-len": [1, 180, 4],
        "arrow-body-style": [0],
        "import/no-unresolved": [0], // Until import plugin supports webpack 2 resolveModules
        "import/no-extraneous-dependencies": 0,
        "no-restricted-syntax": 0
    },
    "globals": {}
}
;