// script.js

// Seleção de elementos já existentes
const cityInput = document.getElementById("cityInput");
const weatherForm = document.getElementById("weatherForm");
const resultDiv = document.getElementById("result");

  /**
   * Formata uma data completa no padrão brasileiro, incluindo dia da semana,
   * data e horário (hora e minutos).
   *
   * @function formatFullDate
   * @param {Date} date - Objeto Date que será formatado.
   * @returns {string} Data formatada no padrão "segunda-feira, 13 de outubro de 2025 14:35".
   *
   * @example
   * const agora = new Date();
   * const dataFormatada = formatFullDate(agora);
   * console.log(dataFormatada);
   */
// Função para formatar data completa (ex: segunda-feira, 13 de outubro de 2025)
function formatFullDate(date) {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

  /**
   * Obtém a hora atual considerando o fuso de Brasília (UTC-3).
   *
   * @function getBrasiliaHour
   * @returns {number} Hora de Brasília (0–23).
   *
   * @example
   * const hora = getBrasiliaHour();
   * console.log(`Agora são ${hora}h em Brasília.`);
   */
// Função para obter hora de Brasília
function getBrasiliaHour() {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const brasiliaHour = (utcHour - 3 + 24) % 24; // Ajusta UTC-3, evita negativo
  return brasiliaHour;
}

  /**
   * Ajusta automaticamente o fundo da página conforme a hora de Brasília.
   * Entre 06h e 18h exibe fundo "dia"; fora desse intervalo, fundo "noite".
   *
   * @function setBackgroundByTime
   * @returns {void}
   *
   * @example
   * setBackgroundByTime();
   */
// Função para trocar fundo conforme hora de Brasília
function setBackgroundByTime() {
  const hour = getBrasiliaHour();
  if (hour >= 6 && hour < 18) {
    // Dia
    document.body.style.background = "linear-gradient(to bottom, #0b3d91 0%, #3da2ff 60%, #a9d8ff 100%)";
  } else {
    // Noite
    document.body.style.background = "linear-gradient(to bottom, #0b1a33 0%, #1a2e59 60%, #334b7f 100%)";
  }
}

  /**
   * Busca coordenadas geográficas (latitude e longitude) de uma cidade
   * utilizando a API pública Open-Meteo Geocoding.
   *
   * @async
   * @function getCoordinates
   * @param {string} city - Nome da cidade para consulta.
   * @returns {Promise<Object>} Objeto contendo latitude, longitude, nome e país.
   *
   * @throws {Error} "Erro na requisição de geocodificação."  
   * @throws {Error} "Cidade não encontrada."
   *
   * @example
   * getCoordinates("São Paulo")
   *   .then(data => console.log(data.latitude, data.longitude))
   *   .catch(err => console.error(err));
   */
// Função para buscar coordenadas da cidade
async function getCoordinates(city) {
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const response = await fetch(geoUrl);
    if (!response.ok) throw new Error("Erro na requisição de geocodificação.");
    const data = await response.json();
    if (!data.results || data.results.length === 0) throw new Error("Cidade não encontrada.");
    return data.results[0];
  } catch (error) {
    throw error;
  }
}

  /**
   * Busca informações meteorológicas atuais de uma coordenada geográfica
   * utilizando a API Open-Meteo.
   *
   * @async
   * @function getWeather
   * @param {number} latitude - Latitude da cidade.
   * @param {number} longitude - Longitude da cidade.
   * @returns {Promise<Object>} Objeto contendo dados de clima atual (temperatura, código do clima, etc.).
   *
   * @throws {Error} "Erro na requisição de clima."
   *
   * @example
   * getWeather(-23.55, -46.63)
   *   .then(weather => console.log(weather.temperature))
   *   .catch(err => console.error(err));
   */
// Função para buscar clima
async function getWeather(latitude, longitude) {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const response = await fetch(weatherUrl);
    if (!response.ok) throw new Error("Erro na requisição de clima.");
    const data = await response.json();
    return data.current_weather;
  } catch (error) {
    throw error;
  }
}

  /**
   * Retorna a descrição textual do clima e o nome da classe de ícone correspondente
   * com base no código meteorológico da API Open-Meteo.
   *
   * @function getWeatherDescriptionAndIcon
   * @param {number} code - Código numérico do clima fornecido pela API.
   * @returns {{desc: string, icon: string}} Objeto contendo descrição e classe de ícone.
   *
   * @example
   * const { desc, icon } = getWeatherDescriptionAndIcon(63);
   * console.log(desc, icon); // "Chuva moderada", "wi-rain"
   */
// Função para obter descrição do clima e ícones
function getWeatherDescriptionAndIcon(code) {
  // Mapear códigos de clima do Open-Meteo para descrição e ícone
  // https://open-meteo.com/en/docs#api_form
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

  /**
   * Listener responsável por interceptar o envio do formulário,
   * realizar validação da entrada, consultar APIs externas e atualizar
   * a interface com os dados meteorológicos formatados.
   *
   * @event submit
   *
   * @example
   * -- O listener já está associado automaticamente:
   * -- weatherForm.addEventListener("submit", ...);
   */
// Listener do formulário
weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  setBackgroundByTime(); // Atualiza fundo

  const city = cityInput.value.trim();
  cityInput.classList.remove("invalid");
  resultDiv.innerHTML = "";

  if (!city) {
    cityInput.classList.add("invalid");
    cityInput.focus();
    resultDiv.innerHTML = `<p style="color:red;">⚠️ Por favor, digite o nome da cidade!</p>`;
    return;
  }

  resultDiv.innerHTML = "🔍 Buscando dados...";

  try {
    const { latitude, longitude, name, country } = await getCoordinates(city);
    const weather = await getWeather(latitude, longitude);
    const { desc, icon } = getWeatherDescriptionAndIcon(weather.weathercode);
    const now = new Date();

    resultDiv.innerHTML = `
      <h2>${name}, ${country}</h2>
      <p>🌡️ Temperatura: ${weather.temperature}°C</p>
      <p>🌤️ Clima: <i class="wi ${icon}"></i> ${desc}</p>
      <p>🕒 Atualizado em: ${formatFullDate(now)}</p>
    `;
  } catch (error) {
    resultDiv.innerHTML = `<p style="color:red;">❌ ${error.message}</p>`;
  }
});

  /**
   * Atualiza automaticamente o fundo da página quando o DOM estiver carregado.
   *
   * @event DOMContentLoaded
   */
// Atualiza fundo automaticamente ao carregar a página
window.addEventListener("DOMContentLoaded", setBackgroundByTime);

  /**
   * Exporta funções para permitir testes unitários (quando em ambiente Node).
   *
   * @module script
   */
if (typeof module !== "undefined") {
  module.exports = { getCoordinates, getWeather };
}

/* 
Resumo do funcionamento:
O usuário digita uma cidade no formulário.
Ao enviar, o JS previne o envio padrão e começa a buscar os dados.
Primeiro, chama getCoordinates(city) para obter latitude e longitude da cidade.
Depois, chama getWeather(latitude, longitude) para pegar o clima atual.
Exibe os resultados formatados na página.
Se ocorrer algum erro (ex.: cidade não encontrada), mostra uma mensagem amigável para o usuário.
*/