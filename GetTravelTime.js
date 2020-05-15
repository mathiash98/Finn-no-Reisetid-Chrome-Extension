import {
  Client as GMapsClient,
  Status,
  DirectionsResponse,
  TravelMode,
} from "@googlemaps/google-maps-services-js";

export default class GetTravelTime {
  apiKey;
  gMapsClient;
  instance;
  constructor(apiKey) {
    if (this.instance) {
      return this.instance;
    }
    this.apiKey = apiKey;
    this.gMapsClient = new GMapsClient();
    this.instance = this;
  }

  getTravelTime({
    fromAddress,
    toAddress,
    arrivalTime = "Wed May 20 2020 08:10:00 GMT+0200 (Central European Summer Time)",
    departureTime,
    travelMode = TravelMode.transit,
  }) {
    return this.gMapsClient.directions({
      params: {
        key: this.apiKey,
        origin: fromAddress,
        destination: toAddress,
        arrival_time: arrivalTime ? new Date(arrivalTime).getTime() / 1000 : undefined,
        departure_time: departureTime ? new Date(departureTime).getTime() / 1000 : undefined,
        mode: travelMode,
      },
    });
  }
}
