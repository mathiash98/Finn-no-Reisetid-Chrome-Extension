window.onload = findAndSetTravelTime;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // listen for messages sent from background.js
        if (request.message === 'urlchange') {
            console.log("urlchange");

            findAndSetTravelTime();
        }
    });

/**
 * Finds all ads in page, search for travelTime and add time to DOM.
 */
async function findAndSetTravelTime() {
    let cache = await getTravelTimeCache();
    let settings = await getSettings();

    if (!settings.apiKey || !settings.toAddress) {
        return;
    }
    const ads = [];
    const adEls = window.document.querySelectorAll(".ads.ads--list article");
    for await (let adEl of adEls) {
        const sqAndPriceDiv = adEl.querySelector(".ads__unit__content__keys");
        const ad = {
            url: (adEl.querySelector("a.ads__unit__link")).href,
            finnkode: stringToNumber(adEl.querySelector("a.ads__unit__link").id),
            title: adEl.querySelector("a.ads__unit__link").text,
            address: adEl.querySelector(".ads__unit__content__details div").textContent,
            price: stringToNumber(sqAndPriceDiv.lastElementChild.textContent),
            sq: stringToNumber(
                sqAndPriceDiv.childElementCount == 1 ? sqAndPriceDiv.firstElementChild.textContent : undefined
            ),
        };
        ads.push(ad);

        try {
            await awaitTimeout(50);
            const travelTimeQuery = {
                title: "getTravelTime",
                fromAddress: ad.address,
                ...settings
            };

            let travelTimeId = "";
            for (const [key, val] of Object.entries(travelTimeQuery)) {
                if (key != "title" && key != "apiKey") {
                    travelTimeId += `${key}:${val}-`;
                }
            }

            await new Promise((resolve) => {
                if (cache.hasOwnProperty(travelTimeId)) {
                    console.log("Found cache for id: " + travelTimeId, cache[travelTimeId]);
                    resolve();
                } else {
                    chrome.runtime.sendMessage(travelTimeQuery, function (data) {
                        console.log("Did not find in cache, adding: " + travelTimeId, data);
                        cache[travelTimeId] = data;
                        resolve();
                    });
                }
            });

            // Add travelTime to DOM
            let travelTimeText = "";
            if (cache[travelTimeId], cache[travelTimeId].routes.length > 0 && cache[travelTimeId].routes[0].legs.length > 0) {
                travelTimeText = cache[travelTimeId].routes[0].legs[0].duration.text;
            }
            const addressDOM = adEl.querySelector(".ads__unit__content__details div");
            addressDOM.textContent += " - Reisetid: " + travelTimeText;

        } catch (error) {
            console.error(error);
        }
    }

    storeTravelTimeCache('travelTimeCache', cache);
}

/**
 * Get cache from chrome storage
 * @returns {Promise<Object<string, gMapsTravelTimeResponse>>}
 */
function getTravelTimeCache() {
    return new Promise((resolve) => {
        chrome.storage.local.get('travelTimeCache', (result) => {
            if (result.travelTimeCache) {
                resolve(result.travelTimeCache);
            } else {
                resolve({});
            }
        });
    });
}

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

/**
 * Store to cache
 * @param {string} key
 * @param {Object} val
 * @returns {Promise}
 */
function storeTravelTimeCache(key, val) {
    return new Promise((resolve) => {
        chrome.storage.local.set({
            [key]: val
        }, () => {
            resolve();
        });
    });
}


/**
 * Convert a string to number.
 * Not well tested
 * @example
 * stringToNumber("5 435 345 kr"); // => 5435345
 * @param {string} s String with some numbers
 */
function stringToNumber(s) {
    try {
        if (s) {
            const removedChars = s.replace(/[^0-9.\-\+]/gi, '');
            if (removedChars.match(/[0-9]/g) != null) {
                const num = Number(removedChars);
                return num && num < 2147483647 && num > -2147483647 ? num : null;
            } else {
                return null;
            }
        } else {
            return null;
        }
    } catch (error) {
        return null
    }
}

/**
 * Add a sleep to your async functions
 * @example
 * await awaitTimeout(1000);
 * @param {number} milliseconds Number of milliseconds to wait
 */
function awaitTimeout(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
}


/**@typedef {object} Settings
 * @property {string} toAddress
 * @property {string} travelMode
 * @property {string} apiKey
 * @property {Date} arrivalTime
 * @property {Date} departureTime
 */

/** @typedef {Object} gMapsTravelTimeResponse
 * @property {geocoded_waypoint[]} geocoded_waypoints
 * @property {route[]} routes
 * @property {String} status
 */

/** @typedef {Object} geocoded_waypoint
 * @property {String} geocoder_status
 * @property {String} place_id
 * @property {Array} types
 */

/** @typedef {Object} route
 * @property {Object} bounds
 * @property {String} copyrights
 * @property {leg[]} legs
 * @property {Object} overview_polyline
 * @property {String} summary
 * @property {Array} warnings
 * @property {Array} waypoint_order
 */

/** @typedef {Object} bounds
 * @property {LatLng} northeast
 * @property {LatLng} southwest
 */

/** @typedef {Object} LatLng
 * @property {number} lat
 * @property {number} lng
 */

/** @typedef {Object} leg
 * @property {Time} arrival_time
 * @property {Time} departure_time
 * @property {TextVal} distance
 * @property {TextVal} duration
 * @property {String} end_address
 * @property {LatLng} end_location
 * @property {String} start_address
 * @property {LatLng} start_location
 * @property {Setp[]} steps
 * @property {Array} traffic_speed_entry
 * @property {Array} via_waypoint
 */

/** @typedef {Object} Time
 * @property {String} text
 * @property {String} time_zone
 * @property {Number} value
 */

/** @typedef {Object} TextVal 
 * @property {String} text 
 * @property {Number} value 
 */

/** @typedef {Object} Step 
 * @property {TextVal} distance 
 * @property {TextVal} duration 
 * @property {LatLng} end_location 
 * @property {String} html_instructions 
 * @property {{points: string}} polyline 
 * @property {LatLng} start_location 
 * @property {Step[]} steps 
 * @property {String} travel_mode 
 */