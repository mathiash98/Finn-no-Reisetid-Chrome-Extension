chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.title === 'getTravelTime') {
        getTravelTimeResponse(message)
            .then(res => {
                sendResponse(res);
            })
            .catch(err => {
                sendResponse(err);
            });
        return true;
    }
});

chrome.tabs.onUpdated.addListener(
    function (tabId, changeInfo, tab) {
        // Check if tab updates
        if (changeInfo.url) {
            chrome.tabs.sendMessage(tabId, {
                message: 'urlchange'
            })
        }
    }
);


/**
 * Get Travel time from to addres with specified transitMode
 * @param {{fromAddress: string, toAddress: string, arrivalTime: DateTime, departureTime: DateTime, travelMode: ("driving"|"walking"|"bicycling"|"transit"), apiKey: string }} param0
 * @returns {gMapsTravelTimeResponse}
 */
function getTravelTimeResponse({
    fromAddress,
    toAddress,
    arrivalTime,
    departureTime,
    travelMode,
    apiKey
}) {
    return new Promise((resolve, reject) => {
        let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${fromAddress.split(" ").join("+")}&destination=${toAddress.split(" ").join("+")}&key=${apiKey}`;
        if (travelMode) {
            url += `&mode=${travelMode}`;
        }
        if (arrivalTime) {
            url += `&arrival_time=${new Date(arrivalTime).getTime() / 1000}`;
        }
        if (departureTime) {
            url += `&departue_time=${new Date(departureTime).getTime() / 1000}`;
        }
        fetch(url)
            .then(res => {
                if (res.ok) {
                    return res.json();
                } else {
                    reject(res.text());
                }
            })
            .then(travelTimeRes => {
                resolve(travelTimeRes);
            })
            .catch(err => {
                reject(err);
            });

    });
}

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