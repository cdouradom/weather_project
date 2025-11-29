// script.js - VERSÃO FINAL COM EFEITOS

// Seleção de elementos
/** @type {HTMLInputElement} Campo de entrada para digitar a cidade */
const cityInput = document.getElementById("cityInput");

/** @type {HTMLFormElement} Formulário principal de busca de clima */
const weatherForm = document.getElementById("weatherForm");

/** @type {HTMLElement} Div onde o resultado do clima atual é exibido */
const resultDiv = document.querySelector(".result");

/** @type {HTMLElement} Seção onde a previsão estendida (5 dias) é exibida */
const forecastSection = document.getElementById("forecastSection");

// -------------------------------------------------------------
// Funções de utilidade
// -------------------------------------------------------------

/**
 * Formata uma data completa no padrão brasileiro com dia da semana e horário.
 *
 * @param {Date} date - Objeto Date a ser formatado.
 * @returns {string} Data formatada (ex: "segunda-feira, 20 de novembro de 2025 14:30").
 */
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
 * Obtém a hora atual em Brasília (UTC-3) baseada no horário local do navegador.
 *
 * @returns {number} Hora em Brasília (0–23).
 */
function getBrasiliaHour() {
  const now = new Date();
  const utcHour = now.getUTCHours();
  return (utcHour - 3 + 24) % 24;
}

/**
 * Define o background da página usando o horário de Brasília.
 * Usado como fallback quando nenhuma cidade foi pesquisada.
 */
function setBackgroundByTime() {
  const hour = getBrasiliaHour();
  if (hour >= 6 && hour < 18) {
    document.body.style.background =
      "linear-gradient(to bottom, #0b3d91 0%, #3da2ff 60%, #a9d8ff 100%)";
  } else {
    document.body.style.background =
      "linear-gradient(to bottom, #0b1a33 0%, #1a2e59 60%, #334b7f 100%)";
  }
}

/**
 * Ajusta o fundo com base no horário **local da cidade buscada**,
 * calculado a partir do timezone offset retornado da API (em segundos).
 *
 * @param {number} timezoneOffset - Deslocamento do fuso horário em segundos.
 */
function setBackgroundByLocalTime(timezoneOffset) {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const localTime = new Date(utcTime + timezoneOffset * 1000);
  const localHour = localTime.getHours();

  console.log(`🕐 Horário local da cidade: ${localHour}h`);

  if (localHour >= 6 && localHour < 18) {
    document.body.style.background =
      "linear-gradient(to bottom, #0b3d91 0%, #3da2ff 60%, #a9d8ff 100%)";
  } else {
    document.body.style.background =
      "linear-gradient(to bottom, #0b1a33 0%, #1a2e59 60%, #334b7f 100%)";
  }
}

/**
 * Obtém latitude e longitude da cidade informada utilizando a
 * Open-Meteo **Geocoding API**.
 *
 * @async
 * @param {string} city - Nome da cidade digitada pelo usuário.
 * @returns {Promise<Object>} Objeto contendo coordenadas e metadados da cidade encontrada.
 * @throws {Error} Quando a cidade não é encontrada ou ocorre erro na requisição.
 *
 * @example
 * const coords = await getCoordinates("São Paulo");
 * console.log(coords.latitude, coords.longitude);
 */
async function getCoordinates(city) {
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city
    )}&count=1`;
    const response = await fetch(geoUrl);
    if (!response.ok)
      throw new Error("Erro na requisição de geocodificação.");
    const data = await response.json();
    if (!data.results || data.results.length === 0)
      throw new Error("Cidade não encontrada.");
    return data.results[0];
  } catch (error) {
    throw error;
  }
}

/**
 * Obtém dados climáticos atuais e variáveis adicionais
 * (umidade, precipitação e vento horário) usando Open-Meteo API.
 *
 * A função busca o horário exato da leitura atual para casar com
 * os dados horários retornados e garantir precisão.
 *
 * @async
 * @param {number} latitude - Latitude da cidade.
 * @param {number} longitude - Longitude da cidade.
 * @returns {Promise<Object>} Dados climáticos completos.
 *
 * @throws {Error} Quando a API não retorna dados válidos,
 *                 ou ocorre erro na requisição.
 *
 * @example
 * const weather = await getWeather(-23.55, -46.63);
 * console.log(weather.temperature);
 */
async function getWeather(latitude, longitude) {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m,precipitation,windspeed_10m&timezone=auto`;
    const response = await fetch(weatherUrl);
    if (!response.ok) throw new Error("Erro na requisição de clima.");
    const data = await response.json();

    if (!data.current_weather)
      throw new Error("Dados de clima atual indisponíveis.");

    let humidity = null;
    let precipitation = null;
    let windspeed_hourly = null;

    // Encontrar índice mais próximo do horário atual
    if (data.hourly && Array.isArray(data.hourly.time)) {
      const times = data.hourly.time;
      const currentTime = data.current_weather.time;
      let idx = times.indexOf(currentTime);

      // Se não encontrar exatamente o horário, pega o mais próximo
      if (idx === -1) {
        const currentMs = new Date(currentTime).getTime();
        let best = 0;
        let bestDiff = Infinity;
        times.forEach((t, i) => {
          const diff = Math.abs(new Date(t).getTime() - currentMs);
          if (diff < bestDiff) {
            bestDiff = diff;
            best = i;
          }
        });
        idx = best;
      }

      humidity = data.hourly.relativehumidity_2m?.[idx] ?? null;
      precipitation = data.hourly.precipitation?.[idx] ?? null;
      windspeed_hourly = data.hourly.windspeed_10m?.[idx] ?? null;
    }

    const windspeed_from_current =
      data.current_weather.windspeed ?? null;

    return {
      ...data.current_weather,
      humidity,
      precipitation,
      windspeed_hourly,
      windspeed_from_current,
      timezone_offset: data.utc_offset_seconds || 0,
      raw: data,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Retorna descrição, ícone correspondente e efeito visual recomendado
 * baseado no código de clima da Open-Meteo.
 *
 * @param {number} code - Código de condição climática.
 * @returns {{desc: string, icon: string, effect: string}} Objeto contendo descrição, ícone e efeito.
 *
 * @example
 * const info = getWeatherDescriptionAndIcon(3);
 * console.log(info.desc); // "Nublado"
 */
function getWeatherDescriptionAndIcon(code) {
  const weatherMap = {
    0: { desc: "Céu limpo", icon: "wi-day-sunny", effect: "sun" },
    1: { desc: "Parcialmente nublado", icon: "wi-day-cloudy", effect: "clouds" },
    2: { desc: "Parcialmente nublado", icon: "wi-day-cloudy", effect: "clouds" },
    3: { desc: "Nublado", icon: "wi-cloudy", effect: "clouds" },
    45: { desc: "Nevoeiro", icon: "wi-fog", effect: "fog" },
    48: { desc: "Depósito de gelo", icon: "wi-fog", effect: "fog" },
    51: { desc: "Chuvisco leve", icon: "wi-sprinkle", effect: "rain" },
    53: { desc: "Chuvisco moderado", icon: "wi-sprinkle", effect: "rain" },
    55: { desc: "Chuvisco intenso", icon: "wi-sprinkle", effect: "rain" },
    61: { desc: "Chuva leve", icon: "wi-rain", effect: "rain" },
    63: { desc: "Chuva moderada", icon: "wi-rain", effect: "rain-heavy" },
    65: { desc: "Chuva intensa", icon: "wi-rain", effect: "rain-heavy" },
    71: { desc: "Neve leve", icon: "wi-snow", effect: "snow" },
    73: { desc: "Neve moderada", icon: "wi-snow", effect: "snow-heavy" },
    75: { desc: "Neve intensa", icon: "wi-snow", effect: "snow-heavy" },
    80: { desc: "Chuva de verão leve", icon: "wi-showers", effect: "rain" },
    81: { desc: "Chuva de verão moderada", icon: "wi-showers", effect: "rain-heavy" },
    82: { desc: "Chuva de verão intensa", icon: "wi-showers", effect: "rain-heavy" },
    95: { desc: "Tempestade", icon: "wi-thunderstorm", effect: "storm" },
    99: { desc: "Granizo", icon: "wi-hail", effect: "hail" },
  };
  return weatherMap[code] || { desc: "Desconhecido", icon: "wi-na", effect: "none" };
}

// -------------------------------------------------------------
// CRIAÇÃO DE EFEITOS VISUAIS REALISTAS
// -------------------------------------------------------------

function createWeatherEffect(effectType) {
  console.log('✨ Criando efeito:', effectType);
  
  // Remove efeitos anteriores
  const oldEffect = document.getElementById("weatherEffect");
  if (oldEffect) oldEffect.remove();

  // Não criar efeito se for "none"
  if (effectType === "none") return;

  const container = document.createElement("div");
  container.id = "weatherEffect";
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    overflow: hidden;
  `;

  document.body.appendChild(container);

  // ===== NUVENS REALISTAS =====
  if (effectType === "clouds") {
    for (let i = 0; i < 8; i++) {
      const cloud = document.createElement("div");
      cloud.className = `realistic-cloud cloud-${i}`;
      container.appendChild(cloud);
    }
    
    const style = document.createElement("style");
    style.textContent = `
      .realistic-cloud {
        position: absolute;
        background: rgba(255, 255, 255, 0.4);
        border-radius: 100px;
        opacity: 0.6;
        animation: floatCloudRealistic linear infinite;
      }
      .realistic-cloud::before,
      .realistic-cloud::after {
        content: '';
        position: absolute;
        background: rgba(255, 255, 255, 0.4);
        border-radius: 100px;
      }
      
      .cloud-0 { width: 180px; height: 60px; top: 8%; left: -200px; animation-duration: 45s; }
      .cloud-0::before { width: 100px; height: 50px; top: -25px; left: 30px; }
      .cloud-0::after { width: 120px; height: 50px; top: -20px; right: 20px; }
      
      .cloud-1 { width: 150px; height: 50px; top: 20%; left: -200px; animation-duration: 50s; animation-delay: 5s; }
      .cloud-1::before { width: 80px; height: 40px; top: -20px; left: 25px; }
      .cloud-1::after { width: 100px; height: 40px; top: -15px; right: 15px; }
      
      .cloud-2 { width: 200px; height: 70px; top: 35%; left: -200px; animation-duration: 55s; animation-delay: 10s; }
      .cloud-2::before { width: 120px; height: 60px; top: -30px; left: 35px; }
      .cloud-2::after { width: 140px; height: 55px; top: -25px; right: 25px; }
      
      .cloud-3 { width: 160px; height: 55px; top: 48%; left: -200px; animation-duration: 48s; animation-delay: 15s; }
      .cloud-3::before { width: 90px; height: 45px; top: -22px; left: 28px; }
      .cloud-3::after { width: 110px; height: 45px; top: -18px; right: 18px; }
      
      .cloud-4 { width: 190px; height: 65px; top: 62%; left: -200px; animation-duration: 52s; animation-delay: 20s; }
      .cloud-4::before { width: 110px; height: 55px; top: -28px; left: 32px; }
      .cloud-4::after { width: 130px; height: 50px; top: -22px; right: 22px; }
      
      .cloud-5 { width: 140px; height: 48px; top: 15%; left: -200px; animation-duration: 46s; animation-delay: 8s; }
      .cloud-5::before { width: 75px; height: 38px; top: -18px; left: 22px; }
      .cloud-5::after { width: 95px; height: 38px; top: -15px; right: 15px; }
      
      .cloud-6 { width: 170px; height: 58px; top: 42%; left: -200px; animation-duration: 49s; animation-delay: 25s; }
      .cloud-6::before { width: 95px; height: 48px; top: -24px; left: 30px; }
      .cloud-6::after { width: 115px; height: 48px; top: -20px; right: 20px; }
      
      .cloud-7 { width: 155px; height: 52px; top: 72%; left: -200px; animation-duration: 51s; animation-delay: 12s; }
      .cloud-7::before { width: 85px; height: 42px; top: -21px; left: 26px; }
      .cloud-7::after { width: 105px; height: 42px; top: -17px; right: 17px; }
      
      @keyframes floatCloudRealistic {
        from { transform: translateX(0); }
        to { transform: translateX(calc(100vw + 250px)); }
      }
    `;
    document.head.appendChild(style);
    console.log('☁️ Nuvens realistas criadas!');
    return;
  }

  // ===== NÉVOA REALISTA =====
  if (effectType === "fog") {
    container.style.background = "linear-gradient(180deg, rgba(200, 200, 200, 0.3) 0%, rgba(220, 220, 220, 0.2) 50%, rgba(200, 200, 200, 0.3) 100%)";
    container.style.backdropFilter = "blur(5px)";
    container.style.animation = "fogPulse 8s ease-in-out infinite";
    
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fogPulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);
    console.log('🌫️ Névoa realista criada!');
    return;
  }

  // ===== SOL REALISTA =====
  if (effectType === "sun") {
    container.innerHTML = `
      <div class="realistic-sun"></div>
      <div class="sun-ray ray-1"></div>
      <div class="sun-ray ray-2"></div>
      <div class="sun-ray ray-3"></div>
      <div class="sun-ray ray-4"></div>
      <div class="sun-ray ray-5"></div>
      <div class="sun-ray ray-6"></div>
    `;
    
    const style = document.createElement("style");
    style.textContent = `
      .realistic-sun {
        position: absolute;
        top: 8%;
        right: 12%;
        width: 100px;
        height: 100px;
        background: radial-gradient(circle, #ffeb3b 0%, #ffc107 40%, rgba(255,193,7,0) 70%);
        border-radius: 50%;
        box-shadow: 0 0 60px rgba(255, 235, 59, 0.8), 0 0 120px rgba(255, 193, 7, 0.4);
        animation: sunPulseRealistic 4s ease-in-out infinite;
      }
      
      .sun-ray {
        position: absolute;
        top: 8%;
        right: 12%;
        width: 150px;
        height: 150px;
        margin: -25px;
        opacity: 0.3;
      }
      
      .sun-ray::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 3px;
        height: 40px;
        background: linear-gradient(to bottom, rgba(255, 235, 59, 0.8), transparent);
        transform-origin: center;
      }
      
      .ray-1 { animation: rotateSunRays 20s linear infinite; }
      .ray-2 { animation: rotateSunRays 20s linear infinite; animation-delay: -3.33s; }
      .ray-3 { animation: rotateSunRays 20s linear infinite; animation-delay: -6.66s; }
      .ray-4 { animation: rotateSunRays 20s linear infinite; animation-delay: -10s; }
      .ray-5 { animation: rotateSunRays 20s linear infinite; animation-delay: -13.33s; }
      .ray-6 { animation: rotateSunRays 20s linear infinite; animation-delay: -16.66s; }
      
      .ray-1::before { transform: translate(-50%, -50%) rotate(0deg); }
      .ray-2::before { transform: translate(-50%, -50%) rotate(60deg); }
      .ray-3::before { transform: translate(-50%, -50%) rotate(120deg); }
      .ray-4::before { transform: translate(-50%, -50%) rotate(180deg); }
      .ray-5::before { transform: translate(-50%, -50%) rotate(240deg); }
      .ray-6::before { transform: translate(-50%, -50%) rotate(300deg); }
      
      @keyframes sunPulseRealistic {
        0%, 100% { transform: scale(1); opacity: 0.9; }
        50% { transform: scale(1.05); opacity: 1; }
      }
      
      @keyframes rotateSunRays {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    console.log('☀️ Sol realista criado!');
    return;
  }

  // ===== PARTÍCULAS REALISTAS (chuva, neve, granizo, tempestade) =====
  const config = {
    rain: { count: 200, speed: 20, type: 'rain' },
    'rain-heavy': { count: 350, speed: 25, type: 'rain' },
    snow: { count: 150, speed: 5, type: 'snow' },
    'snow-heavy': { count: 250, speed: 8, type: 'snow' },
    storm: { count: 300, speed: 23, type: 'rain' },
    hail: { count: 180, speed: 30, type: 'hail' }
  };

  const settings = config[effectType] || config.rain;

  // Criar partículas realistas
  for (let i = 0; i < settings.count; i++) {
    const particle = document.createElement("div");
    const left = Math.random() * 100;
    const delay = Math.random() * 5;
    const duration = (8 + Math.random() * 4) / (settings.speed / 10);
    
    if (settings.type === 'rain') {
      // Gotas de chuva realistas (linhas finas)
      particle.style.cssText = `
        position: absolute;
        left: ${left}%;
        top: -20px;
        width: 2px;
        height: ${15 + Math.random() * 15}px;
        background: linear-gradient(to bottom, rgba(174, 194, 224, 0.8), rgba(174, 194, 224, 0.3));
        opacity: ${0.5 + Math.random() * 0.5};
        animation: fallRain ${duration}s linear ${delay}s infinite;
      `;
    } else if (settings.type === 'snow') {
      // Flocos de neve realistas
      const size = 4 + Math.random() * 6;
      particle.style.cssText = `
        position: absolute;
        left: ${left}%;
        top: -20px;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.3) 100%);
        border-radius: 50%;
        opacity: ${0.7 + Math.random() * 0.3};
        animation: fallSnow ${duration * 1.5}s linear ${delay}s infinite;
        box-shadow: 0 0 ${size}px rgba(255, 255, 255, 0.5);
      `;
    } else if (settings.type === 'hail') {
      // Granizo realista
      const size = 5 + Math.random() * 8;
      particle.style.cssText = `
        position: absolute;
        left: ${left}%;
        top: -20px;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(200, 220, 240, 0.8));
        border-radius: 50%;
        opacity: ${0.8 + Math.random() * 0.2};
        animation: fallHail ${duration * 0.8}s linear ${delay}s infinite;
        box-shadow: inset -2px -2px 4px rgba(0, 0, 0, 0.2);
      `;
    }

    container.appendChild(particle);
  }

  // Adicionar animações CSS
  const styleId = 'weatherAnimation-' + effectType;
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes fallRain {
        to {
          transform: translateY(${window.innerHeight + 50}px) translateX(${Math.random() * 50 - 25}px);
          opacity: 0;
        }
      }
      
      @keyframes fallSnow {
        to {
          transform: translateY(${window.innerHeight + 50}px) translateX(${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg);
          opacity: 0;
        }
      }
      
      @keyframes fallHail {
        to {
          transform: translateY(${window.innerHeight + 50}px) translateX(${Math.random() * 30 - 15}px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  console.log(`✨ ${settings.count} partículas realistas criadas!`);

  // ===== RELÂMPAGOS PARA TEMPESTADE =====
  if (effectType === "storm") {
    let lightningInterval = setInterval(() => {
      if (Math.random() > 0.65) {
        // Relâmpago realista com múltiplos flashes
        container.style.background = "rgba(255, 255, 255, 0.4)";
        setTimeout(() => {
          container.style.background = "transparent";
          setTimeout(() => {
            container.style.background = "rgba(255, 255, 255, 0.6)";
            setTimeout(() => {
              container.style.background = "transparent";
            }, 50);
          }, 80);
        }, 60);
      }
    }, 2000);
    
    // Limpar intervalo quando remover o efeito
    container.dataset.lightningInterval = lightningInterval;
    console.log('⚡ Tempestade realista com relâmpagos!');
  }
}

async function getForecast(latitude, longitude) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erro ao buscar previsão.");
    const data = await response.json();
    return data.daily;
  } catch (error) {
    throw error;
  }
}

function renderForecast(forecastData) {
  forecastSection.classList.remove("hidden");
  forecastSection.innerHTML = `
    <h3 class="forecast-title">Previsão dos próximos dias</h3>
    <div class="forecast-cards"></div>
  `;
  const container = forecastSection.querySelector(".forecast-cards");

  (forecastData.time || []).slice(0, 5).forEach((date, index) => {
    const max = forecastData.temperature_2m_max[index];
    const min = forecastData.temperature_2m_min[index];
    const precip = forecastData.precipitation_sum ? forecastData.precipitation_sum[index] : null;

    const dayName = new Date(date).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
    });

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <p class="forecast-day">${dayName}</p>
      <i class="wi wi-thermometer" style="font-size: 2rem; margin: 8px 0;"></i>
      <p>🌡️ Máx: <strong>${max}°C</strong></p>
      <p>❄️ Mín: <strong>${min}°C</strong></p>
      ${precip !== null ? `<p>💧 Precip: <strong>${precip} mm</strong></p>` : ""}
    `;
    container.appendChild(card);
  });
}

function resetResult() {
  resultDiv.classList.add("empty");
  resultDiv.innerHTML = `
    <div class="result-header">
      <h2>Resultado</h2>
    </div>
  `;
  forecastSection.classList.add("hidden");
  forecastSection.innerHTML = "";
  
  const oldEffect = document.getElementById("weatherEffect");
  if (oldEffect) oldEffect.remove();
}

// -------------------------------------------------------------
// EVENTO PRINCIPAL
// -------------------------------------------------------------

weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setBackgroundByTime(); // Usa horário BR inicialmente

  const city = cityInput.value.trim();
  cityInput.classList.remove("invalid");

  if (!city) {
    cityInput.classList.add("invalid");
    cityInput.focus();
    resetResult();
    resultDiv.classList.remove("empty");
    resultDiv.innerHTML = `
      <div class="result-header">
        <h2 style="color: #ff4d4f;">⚠️ Por favor, digite o nome da cidade!</h2>
      </div>
    `;
    return;
  }

  resultDiv.classList.remove("empty");
  resultDiv.innerHTML = `
    <div class="result-header">
      <h2>🔍 Buscando dados...</h2>
    </div>
  `;
  forecastSection.classList.add("hidden");

  try {
    const { latitude, longitude, name, country } = await getCoordinates(city);
    const weather = await getWeather(latitude, longitude);
    const { desc, icon, effect } = getWeatherDescriptionAndIcon(weather.weathercode);

    // Ajustar fundo pelo horário local da cidade
    setBackgroundByLocalTime(weather.timezone_offset);

    console.log('🌍 Clima:', desc, '| Efeito:', effect);
    createWeatherEffect(effect);

    let windValue = null;
    if (weather.windspeed_from_current !== null && typeof weather.windspeed_from_current !== "undefined") {
      windValue = weather.windspeed_from_current;
    } else if (weather.windspeed_hourly !== null && typeof weather.windspeed_hourly !== "undefined") {
      windValue = weather.windspeed_hourly;
    }

    let windMs = null;
    let windKmh = null;
    if (windValue !== null) {
      windMs = Number(windValue);
      windKmh = (windMs * 3.6);
      if (windValue > 60) {
        windKmh = Number(windValue);
        windMs = (windKmh / 3.6);
      }
      windMs = Math.round(windMs * 10) / 10;
      windKmh = Math.round(windKmh);
    }

    const humidityText = (weather.humidity !== null && typeof weather.humidity !== "undefined")
      ? `${weather.humidity}%`
      : "—";

    const precipitationText = (weather.precipitation !== null && typeof weather.precipitation !== "undefined")
      ? `${weather.precipitation} mm`
      : "0 mm";

    const windText = windMs !== null ? `${windKmh} km/h` : "—";

    resultDiv.classList.remove("empty");
    resultDiv.innerHTML = `
      <div class="result-header">
        <h2>${name}, ${country}</h2>
      </div>

      <div class="result-info-card temp-card">
        <span class="label">🌡️ Temperatura</span>
        <div class="value">
          <i class="wi ${icon}"></i>
          ${weather.temperature}°C
        </div>
      </div>

      <div class="result-info-card climate-card">
        <i class="wi ${icon}"></i>
        <span class="label">Clima</span>
        <div class="description">${desc}</div>
      </div>

      <div class="result-info-card">
        <span class="label">💧 Umidade</span>
        <div class="value">${humidityText}</div>
      </div>

      <div class="result-info-card">
        <span class="label">🌬️ Vento</span>
        <div class="value">${windText}</div>
        <div class="description">${windMs !== null ? `${windMs} m/s` : ''}</div>
      </div>

      <div class="result-info-card">
        <span class="label">☔ Precipitação</span>
        <div class="value">${precipitationText}</div>
      </div>

      <div class="result-info-card" style="grid-column: 1 / -1;">
        <span class="label">🕒 Atualizado em</span>
        <div class="description">${formatFullDate(new Date())}</div>
      </div>
    `;

    const forecast = await getForecast(latitude, longitude);
    renderForecast(forecast);

  } catch (error) {
    resultDiv.classList.remove("empty");
    resultDiv.innerHTML = `
      <div class="result-header">
        <h2 style="color: #ff4d4f;">❌ ${error.message}</h2>
      </div>
    `;
    forecastSection.classList.add("hidden");
  }
});

window.addEventListener("DOMContentLoaded", setBackgroundByTime);

// ===== BOTÃO DE TESTE DE EFEITOS (REMOVA DEPOIS) =====
window.testWeatherEffect = function(effect) {
  console.log('🧪 TESTE: Forçando efeito', effect);
  createWeatherEffect(effect);
};

// Para testar, abra o console (F12) e digite:
// testWeatherEffect('rain')
// testWeatherEffect('snow')
// testWeatherEffect('storm')
// testWeatherEffect('hail')
// testWeatherEffect('fog')
// testWeatherEffect('sun')
// testWeatherEffect('clouds')

if (typeof module !== "undefined") {
  module.exports = { getCoordinates, getWeather, getForecast };
}