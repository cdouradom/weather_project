// Import das funções de API
import { getCoordinates, getWeather, getWeatherDescriptionAndIcon } from "./api.js";

/**
 * Função pura que encapsula toda a lógica da API
 * - Recebe uma cidade
 * - Retorna dados de clima formatados
 * Não depende do DOM → testável em Jest puro
 */
export async function fetchWeatherByCity(city) {
  const coords = await getCoordinates(city);
  const weather = await getWeather(coords.latitude, coords.longitude);
  const { desc, icon } = getWeatherDescriptionAndIcon(weather.weathercode);

  return {
    city: coords.name,
    temperature: weather.temperature,
    description: desc,
    icon
  };
}

/**
 * Função que atualiza o DOM com os dados do clima
 * - Recebe objeto retornado por fetchWeatherByCity
 */
export function displayWeatherResult(result) {
  const resultDiv = document.querySelector("#result");
  if (!resultDiv) return;

  resultDiv.innerHTML = `
    <h2>${result.city}</h2>
    <p>Temperatura: ${result.temperature}°C</p>
    <p>Clima: ${result.description}</p>
    <i class="wi ${result.icon}"></i>
  `;
}

/**
 * Função que trata submissão do formulário
 * - Recebe o evento do submit
 * - Pode ser testada de forma isolada chamando fetchWeatherByCity
 */
export async function handleFormSubmit(event) {
  event.preventDefault();

  const cityInput = document.querySelector("#city");
  if (!cityInput) return;

  const city = cityInput.value;

  try {
    const result = await fetchWeatherByCity(city);
    displayWeatherResult(result);
  } catch (error) {
    const resultDiv = document.querySelector("#result");
    if (resultDiv) {
      resultDiv.textContent = `Erro: ${error.message}`;
    }
  }
}

/**
 * Inicialização do listener do formulário
 * - Pode ser usada no navegador
 */
export function initWeatherFormListener() {
  const weatherForm = document.querySelector("#weather-form");
  if (!weatherForm) return;

  weatherForm.addEventListener("submit", handleFormSubmit);
}

// Só roda no navegador
if (typeof window !== "undefined") {
  initWeatherFormListener();
}
