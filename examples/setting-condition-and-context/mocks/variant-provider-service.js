const experimentConfig = require('../config/experiments.config.json');

const variantNames = experimentConfig.experiments[0].variants.map(variant => variant.name);
const customerIdMap = new Map();

const getRandomVariant = () => {
    return variantNames[Math.floor(Math.random() * 3)];
};

const getVariant = (customerId) => {
    return new Promise((resolve) => {
        if (customerIdMap.has(customerId)) {
            resolve({ variantName: customerIdMap.get(customerId), customerId });
            return;
        }

        const newVariantName = getRandomVariant();
        customerIdMap.set(customerId, newVariantName);
        resolve({ variantName: newVariantName, customerId });
    });
};

module.exports = getVariant;
