const variantMap = {
    FeatureA: {
        '1111': 'VariantA',
        '2222': 'VariantB',
    },
    FeatureB: {
        '1111': 'VariantA',
        '2222': 'VariantB',
    },
};


const variantProviderMock = (experimentName, customerId) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const variantName = variantMap[experimentName][customerId];
            resolve({
                variant: variantName,
            });
        }, 100);
    });
};

module.exports = variantProviderMock;
