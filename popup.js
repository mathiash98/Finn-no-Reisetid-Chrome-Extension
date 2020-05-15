window.onload = async () => {
    const settings = await getSettings();
    document.getElementById('toAddress').value = settings.toAddress;
    document.getElementById('apiKey').value = settings.apiKey;
    document.getElementById('travelMode').value = settings.travelMode;
    document.getElementById('arrivalTime').value = settings.arrivalTime;
    document.getElementById('departureTime').value = settings.departureTime;
};

document.getElementById('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    console.log(e.target);
    const settings = {
        toAddress: e.target.elements['toAddress'].value,
        apiKey: e.target.elements['apiKey'].value,
        travelMode: e.target.elements['travelMode'].value,
        arrivalTime: e.target.elements['arrivalTime'].value ? new Date(e.target.elements['arrivalTime'].value) : undefined,
        departureTime: e.target.elements['departureTime'].value ? new Date(e.target.elements['departureTime'].value) : undefined,
    };
    console.log(settings);
    storeSettings(settings);

});

/**
 * Get settings from cache
 * @returns {Promise<Settings>}
 */
function getSettings() {
    return new Promise((resolve) => {
        chrome.storage.local.get('settings', (result) => {
            if (result.settings) {
                resolve(result.settings);
            } else {
                resolve({
                    toAddress: "Bergen",
                    travelMode: "transit",
                    apiKey: undefined,
                    arrivalTime: undefined,
                    departureTime: undefined
                });
            }
        });
    });
}

/**
 * Save settings to cache
 * @property {Settings} settings
 * @returns {Promise}
 */
function storeSettings(settings) {
    return new Promise((resolve) => {
        chrome.storage.local.set({
            'settings': settings
        }, () => {
            resolve();
        });
    });
}

/**@typedef {object} Settings
 * @property {string} toAddress
 * @property {string} travelMode
 * @property {string} apiKey
 * @property {Date} arrivalTime
 * @property {Date} departureTime
 */