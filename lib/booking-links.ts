// ── Smart Booking Link Resolvers ─────────────────────────────────────────────
//
// Builds direct booking URLs from structured data instead of relying on AI-generated links.
// Falls back to Google Flights / Booking.com / Google Search when no direct match is found.

// ── Types ────────────────────────────────────────────────────────────────────

export interface FlightInfo {
  airline: string;
  origin: string;       // airport code e.g. "JFK"
  destination: string;  // airport code e.g. "MAD"
  departDate?: string;  // YYYY-MM-DD
  returnDate?: string;
  passengers?: number;
}

export interface HotelInfo {
  name: string;         // hotel name or area
  location: string;     // city or neighborhood
  provider?: string;    // "Hotel", "Airbnb", etc.
  checkIn?: string;
  checkOut?: string;
}

export interface TicketInfo {
  matchup: string;
  venue: string;
  date: string;
}

export interface ResolvedLink {
  url: string;
  isDirect: boolean;
}

// ── Route parser ─────────────────────────────────────────────────────────────

export function parseRouteCodes(route: string): { origin: string; destination: string } | null {
  const match = route.match(/\b([A-Z]{3})\b\s*(?:→|->|–|—|-|to)\s*\b([A-Z]{3})\b/i);
  if (match) return { origin: match[1].toUpperCase(), destination: match[2].toUpperCase() };
  return null;
}

// ── Flight booking URLs ──────────────────────────────────────────────────────

type FlightUrlBuilder = (info: FlightInfo) => string;

const AIRLINE_URLS: Record<string, FlightUrlBuilder> = {
  "iberia": (i) =>
    `https://www.iberia.com/us/flights/?market=US&language=en&TRIP_TYPE=2&BEGIN_CITY_01=${i.origin}&END_CITY_01=${i.destination}`,

  "american airlines": (i) =>
    `https://www.aa.com/booking/search?locale=en_US&pax=${i.passengers || 1}&type=roundTrip&origin=${i.origin}&destination=${i.destination}`,

  "american": (i) =>
    `https://www.aa.com/booking/search?locale=en_US&pax=${i.passengers || 1}&type=roundTrip&origin=${i.origin}&destination=${i.destination}`,

  "delta": (i) =>
    `https://www.delta.com/flight-search/book-a-flight?action=findFlights&tripType=ROUND_TRIP&originCity=${i.origin}&destinationCity=${i.destination}`,

  "united": (i) =>
    `https://www.united.com/en/us/fsr/choose-flights?f=${i.origin}&t=${i.destination}&tt=1`,

  "lufthansa": (i) =>
    `https://www.lufthansa.com/us/en/select-flights?searchType=ROUNDTRIP&origin=${i.origin}&destination=${i.destination}`,

  "british airways": (i) =>
    `https://www.britishairways.com/travel/book/public/en_us?from=${i.origin}&to=${i.destination}`,

  "air france": (i) =>
    `https://wwws.airfrance.us/search/open-dates?pax=1:0:0:0:0:0:0:0&cabinClass=ECONOMY&activeConnection=0&connections=${i.origin}>${i.destination}`,

  "klm": (i) =>
    `https://www.klm.us/search/offers?pax=1:0:0:0:0:0:0:0&cabinClass=ECONOMY&activeConnection=0&connections=${i.origin}>${i.destination}`,

  "emirates": (i) =>
    `https://www.emirates.com/us/english/book/?from=${i.origin}&to=${i.destination}`,

  "southwest": (i) =>
    `https://www.southwest.com/air/booking/select.html?originationAirportCode=${i.origin}&destinationAirportCode=${i.destination}&tripType=roundtrip`,

  "jetblue": (i) =>
    `https://www.jetblue.com/booking/flights?from=${i.origin}&to=${i.destination}`,

  "ryanair": (i) =>
    `https://www.ryanair.com/us/en/trip/flights/select?adults=${i.passengers || 1}&origin=${i.origin}&destination=${i.destination}`,

  "spirit": (i) =>
    `https://www.spirit.com/book/flights?DN=1&ADT=${i.passengers || 1}&orgCode=${i.origin}&dstCode=${i.destination}`,

  "frontier": (i) =>
    `https://booking.flyfrontier.com/Flight/InternalSelect?o1=${i.origin}&d1=${i.destination}&ADT=${i.passengers || 1}`,

  "alaska airlines": (i) =>
    `https://www.alaskaair.com/search?A=${i.passengers || 1}&SC=${i.origin}&EC=${i.destination}`,

  "alaska": (i) =>
    `https://www.alaskaair.com/search?A=${i.passengers || 1}&SC=${i.origin}&EC=${i.destination}`,

  "tap portugal": (i) =>
    `https://www.flytap.com/en-us/booking?origin=${i.origin}&destination=${i.destination}`,

  "tap air portugal": (i) =>
    `https://www.flytap.com/en-us/booking?origin=${i.origin}&destination=${i.destination}`,

  "turkish airlines": (i) =>
    `https://www.turkishairlines.com/en-us/flights/?origin=${i.origin}&destination=${i.destination}`,

  "norwegian": (i) =>
    `https://www.norwegian.com/us/booking/flight-offers/?AdultCount=${i.passengers || 1}&D_City=${i.origin}&A_City=${i.destination}&TripType=2`,

  "aer lingus": (i) =>
    `https://www.aerlingus.com/booking/select-flights?adult=${i.passengers || 1}&origin=${i.origin}&destination=${i.destination}`,

  "virgin atlantic": (i) =>
    `https://www.virginatlantic.com/book/flights?origin=${i.origin}&destination=${i.destination}`,

  "qatar airways": (i) =>
    `https://www.qatarairways.com/en-us/booking.html?from=${i.origin}&to=${i.destination}`,

  "singapore airlines": (i) =>
    `https://www.singaporeair.com/en_UK/ppsclub-krisflyer/flightsearch/?from=${i.origin}&to=${i.destination}`,

  "cathay pacific": (i) =>
    `https://www.cathaypacific.com/cx/en_US/book-a-trip/flight-search.html?origin=${i.origin}&destination=${i.destination}`,

  "japan airlines": (i) =>
    `https://www.jal.co.jp/en/inter/booking/?from=${i.origin}&to=${i.destination}`,

  "ana": (i) =>
    `https://www.ana.co.jp/en/us/book-plan/search/?from=${i.origin}&to=${i.destination}`,

  "korean air": (i) =>
    `https://www.koreanair.com/booking/best-prices?origin=${i.origin}&destination=${i.destination}`,

  "copa airlines": (i) =>
    `https://www.copaair.com/en-us/web/gs/flight-search?origin=${i.origin}&destination=${i.destination}`,

  "avianca": (i) =>
    `https://www.avianca.com/us/en/booking/?origin=${i.origin}&destination=${i.destination}`,

  "latam": (i) =>
    `https://www.latamairlines.com/us/en/booking?origin=${i.origin}&destination=${i.destination}`,

  "volaris": (i) =>
    `https://www.volaris.com/en/booking?origin=${i.origin}&destination=${i.destination}`,
};

function googleFlights(info: FlightInfo): string {
  return `https://www.google.com/travel/flights?q=flights+from+${info.origin}+to+${info.destination}`;
}

export function getFlightBookingUrl(info: FlightInfo): ResolvedLink {
  if (!info.origin || !info.destination) {
    return { url: googleFallback(`${info.airline} flights`), isDirect: false };
  }

  const key = info.airline.toLowerCase().trim();

  // Exact match
  if (AIRLINE_URLS[key]) {
    return { url: AIRLINE_URLS[key](info), isDirect: true };
  }

  // Partial match — "Iberia Airlines" → "iberia", "Delta Air Lines" → "delta"
  const partial = Object.keys(AIRLINE_URLS).find(
    (k) => key.includes(k) || k.includes(key),
  );
  if (partial) {
    return { url: AIRLINE_URLS[partial](info), isDirect: true };
  }

  // Fall back to Google Flights (better than raw search)
  return { url: googleFlights(info), isDirect: false };
}

// ── Hotel / Accommodation booking URLs ───────────────────────────────────────

type HotelUrlBuilder = (info: HotelInfo) => string;

const HOTEL_URLS: Record<string, HotelUrlBuilder> = {
  "airbnb": (i) =>
    `https://www.airbnb.com/s/${encodeURIComponent(i.location)}/homes?query=${encodeURIComponent(i.location)}`,

  "booking.com": (i) =>
    `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(i.name + " " + i.location)}`,

  "booking": (i) =>
    `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(i.name + " " + i.location)}`,

  "marriott": (i) =>
    `https://www.marriott.com/search/default.mi?keyword=${encodeURIComponent(i.name + " " + i.location)}`,

  "hilton": (i) =>
    `https://www.hilton.com/en/search/?query=${encodeURIComponent(i.name + " " + i.location)}`,

  "hyatt": (i) =>
    `https://www.hyatt.com/search/${encodeURIComponent(i.location)}`,

  "ihg": (i) =>
    `https://www.ihg.com/hotels/us/en/find-hotels/select-hotel?qDest=${encodeURIComponent(i.location)}`,

  "holiday inn": (i) =>
    `https://www.ihg.com/hotels/us/en/find-hotels/select-hotel?qDest=${encodeURIComponent(i.name + " " + i.location)}`,

  "nh collection": (i) =>
    `https://www.nh-hotels.com/en/search?query=${encodeURIComponent(i.name + " " + i.location)}`,

  "nh hotels": (i) =>
    `https://www.nh-hotels.com/en/search?query=${encodeURIComponent(i.name + " " + i.location)}`,

  "premier inn": (i) =>
    `https://www.premierinn.com/gb/en/search.html?searchTerm=${encodeURIComponent(i.location)}`,

  "travelodge": (i) =>
    `https://www.travelodge.co.uk/search?search=${encodeURIComponent(i.location)}`,

  "best western": (i) =>
    `https://www.bestwestern.com/en_US/hotels/find-hotels.html?query=${encodeURIComponent(i.name + " " + i.location)}`,

  "radisson": (i) =>
    `https://www.radissonhotels.com/en-us/search?searchType=geographic&query=${encodeURIComponent(i.location)}`,

  "accor": (i) =>
    `https://all.accor.com/ssr/app/accor/rates/${encodeURIComponent(i.location)}/index.en.shtml`,

  "novotel": (i) =>
    `https://all.accor.com/ssr/app/accor/rates/${encodeURIComponent(i.location)}/index.en.shtml`,

  "ibis": (i) =>
    `https://all.accor.com/ssr/app/accor/rates/${encodeURIComponent(i.location)}/index.en.shtml`,

  "melia": (i) =>
    `https://www.melia.com/en/hotels?search=${encodeURIComponent(i.location)}`,

  "four seasons": (i) =>
    `https://www.fourseasons.com/search/?q=${encodeURIComponent(i.name + " " + i.location)}`,

  "hostelworld": (i) =>
    `https://www.hostelworld.com/s?q=${encodeURIComponent(i.location)}&search_keywords=${encodeURIComponent(i.name)}`,

  "vrbo": (i) =>
    `https://www.vrbo.com/search?destination=${encodeURIComponent(i.location)}`,

  "expedia": (i) =>
    `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(i.name + " " + i.location)}`,
};

// Keywords in type/name that map to Airbnb
const AIRBNB_KEYWORDS = ["apartment", "flat", "studio", "loft", "house", "condo", "villa"];

export function getHotelBookingUrl(info: HotelInfo): ResolvedLink {
  const provider = (info.provider || "").toLowerCase().trim();
  const name = info.name.toLowerCase();

  // Check explicit provider
  if (provider && HOTEL_URLS[provider]) {
    return { url: HOTEL_URLS[provider](info), isDirect: true };
  }

  // Check if provider or type mentions Airbnb
  if (provider.includes("airbnb") || name.includes("airbnb")) {
    return { url: HOTEL_URLS["airbnb"](info), isDirect: true };
  }

  // Check for known hotel chains in the name
  const brandMatch = Object.keys(HOTEL_URLS).find(
    (k) => name.includes(k) || provider.includes(k),
  );
  if (brandMatch) {
    return { url: HOTEL_URLS[brandMatch](info), isDirect: true };
  }

  // Check for Airbnb-style keywords
  if (AIRBNB_KEYWORDS.some((kw) => name.includes(kw) || provider.includes(kw))) {
    return { url: HOTEL_URLS["airbnb"](info), isDirect: true };
  }

  // Default to Booking.com search (best generic hotel search)
  return {
    url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(info.name + " " + info.location)}`,
    isDirect: false,
  };
}

// ── Ticket URLs ──────────────────────────────────────────────────────────────

export function getTicketUrl(info: TicketInfo): ResolvedLink {
  const q = `${info.matchup} ${info.venue} ${info.date}`.trim();
  return {
    url: `https://www.ticketmaster.com/search?q=${encodeURIComponent(q)}`,
    isDirect: true,
  };
}

// ── Location URLs (Google Maps) ──────────────────────────────────────────────

export function getLocationUrl(name: string, city: string): string {
  const q = `${name} ${city}`.replace(/\s+/g, "+");
  return `https://www.google.com/maps/search/${q}`;
}

// ── Embassy URL ──────────────────────────────────────────────────────────────

export function getEmbassyUrl(city: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent("US Embassy " + city)}`;
}

// ── Google fallback ──────────────────────────────────────────────────────────

export function googleFallback(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}
