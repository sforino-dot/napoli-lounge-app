export type Place = { name: string; region?: string; country?: string; lat: number; lon: number };
export type Weather = { temp: number; humidity: number; wind: number; code: number };

const WMO: Record<number, string> = {
  0: "Sereno", 1: "Preval. sereno", 2: "Parz. nuvoloso", 3: "Coperto", 45: "Nebbia", 48: "Nebbia gelata",
  51: "Pioviggine", 53: "Pioviggine", 55: "Pioviggine fitta", 61: "Pioggia", 63: "Pioggia", 65: "Pioggia forte",
  71: "Neve", 73: "Neve", 75: "Neve forte", 77: "Granelli di neve", 80: "Rovesci", 81: "Rovesci",
  82: "Rovesci violenti", 95: "Temporale", 96: "Temporale con grandine", 99: "Temporale con grandine",
};
export const wmoLabel = (code: number) => WMO[code] ?? "—";

async function getJson(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

export async function reverseGeocode(lat: number, lon: number): Promise<Place> {
  try {
    const d = await getJson(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=it`,
    );
    return {
      name: d.city || d.locality || d.principalSubdivision || "La tua posizione",
      region: d.principalSubdivision,
      country: d.countryName,
      lat,
      lon,
    };
  } catch {
    return { name: "La tua posizione", lat, lon };
  }
}

export async function searchCity(q: string): Promise<Place | null> {
  const d = await getJson(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=it`,
  );
  const r = d?.results?.[0];
  if (!r) return null;
  return { name: r.name, region: r.admin1, country: r.country, lat: r.latitude, lon: r.longitude };
}

export async function fetchWeather(p: Place): Promise<Weather> {
  const d = await getJson(
    `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`,
  );
  const c = d.current;
  return { temp: c.temperature_2m, humidity: c.relative_humidity_2m, wind: c.wind_speed_10m, code: c.weather_code };
}
