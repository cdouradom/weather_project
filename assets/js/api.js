// assets/js/api.js
// Arquivo separado somente para funções de API (geocodificação e clima)

// Buscar coordenadas da cidade
export async function getCoordinates(city) {
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city
    )}&count=1`;

    const response = await fetch(geoUrl);

    if (!response.ok) {
      throw new Error("Erro ao buscar coordenadas.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error("Cidade não encontrada.");
    }

    return data.results[0]; // latitude, longitude, nome, país
  } catch (error) {
    throw error;
  }
}

// Buscar clima pela latitude e longitude
export async function getWeather(latitude, longitude) {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

    const response = await fetch(weatherUrl);

    if (!response.ok) {
      throw new Error("Erro ao buscar clima.");
    }

    const data = await response.json();

    return data.current_weather; // {temperature, weathercode, windspeed, ...}
  } catch (error) {
    throw error;
  }
}

// Mapeamento de weathercode para descrição e ícone (Weather Icons)
export function getWeatherDescriptionAndIcon(code) {
  const weatherMap = {
    0: { desc: "Céu limpo", icon: "wi-day-sunny" },
    1: { desc: "Parcialmente nublado", icon: "wi-day-cloudy" },
    2: { desc: "Parcialmente nublado", icon: "wi-day-cloudy" },
    3: { desc: "Nublado", icon: "wi-cloudy" },
    45: { desc: "Nevoeiro", icon: "wi-fog" },
    48: { desc: "Depósito de gelo", icon: "wi-fog" },
    51: { desc: "Chuvisco leve", icon: "wi-sprinkle" },
    53: { desc: "Chuvisco moderado", icon: "wi-sprinkle" },
    55: { desc: "Chuvisco intenso", icon: "wi-sprinkle" },
    61: { desc: "Chuva leve", icon: "wi-rain" },
    63: { desc: "Chuva moderada", icon: "wi-rain" },
    65: { desc: "Chuva intensa", icon: "wi-rain" },
    71: { desc: "Neve leve", icon: "wi-snow" },
    73: { desc: "Neve moderada", icon: "wi-snow" },
    75: { desc: "Neve intensa", icon: "wi-snow" },
    80: { desc: "Chuva de verão leve", icon: "wi-showers" },
    81: { desc: "Chuva de verão moderada", icon: "wi-showers" },
    82: { desc: "Chuva de verão intensa", icon: "wi-showers" },
    95: { desc: "Tempestade com trovões", icon: "wi-thunderstorm" },
    99: { desc: "Granizo", icon: "wi-hail" },
  };
  return weatherMap[code] || { desc: "Desconhecido", icon: "wi-na" };
}