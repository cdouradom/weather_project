// Seleção de elementos
const cityInput = document.getElementById("cityInput");
const weatherForm = document.getElementById("weatherForm");
const resultDiv = document.getElementById("result");

// Remove classe de erro enquanto digita
cityInput.addEventListener("input", () => {
  cityInput.classList.remove("invalid");
  resultDiv.innerHTML = ""; // limpa mensagem antiga
});

// Função para buscar coordenadas
async function getCoordinates(city) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const response = await fetch(geoUrl);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("Cidade não encontrada. Tente novamente.");
  }

  const { latitude, longitude, name, country } = data.results[0];
  return { latitude, longitude, name, country };
}

// Função para buscar clima
async function getWeather(latitude, longitude) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
  const response = await fetch(weatherUrl);
  const data = await response.json();
  return data.current_weather;
}

// Listener do formulário
weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // previne envio padrão

  const city = cityInput.value.trim();

  // Limpa estado anterior
  cityInput.classList.remove("invalid");
  resultDiv.innerHTML = "";

  // Validação: campo vazio
  if (!city) {
    cityInput.classList.add("invalid"); // borda vermelha
    cityInput.focus();                   // foco no input
    resultDiv.innerHTML = `<p style="color: red;">⚠️ Por favor, digite o nome da cidade!</p>`;
    return; // para execução
  }

  // Mostra carregamento
  resultDiv.innerHTML = "🔍 Buscando dados...";

  try {
    const { latitude, longitude, name, country } = await getCoordinates(city);
    const weather = await getWeather(latitude, longitude);

    // Mostra resultados
    resultDiv.innerHTML = `
      <h2>${name}, ${country}</h2>
      <p>🌡️ Temperatura: ${weather.temperature}°C</p>
      <p>💨 Vento: ${weather.windspeed} km/h</p>
      <p>🧭 Direção: ${weather.winddirection}°</p>
      <p>🕒 Atualizado em: ${new Date(weather.time).toLocaleString("pt-BR")}</p>
    `;
  } catch (error) {
    resultDiv.innerHTML = `<p style="color: red;">❌ ${error.message}</p>`;
  }
});


/* 
Resumo do funcionamento:
O usuário digita uma cidade no formulário.
Ao enviar, o JS previne o envio padrão e começa a buscar os dados.
Primeiro, chama getCoordinates(city) para obter latitude e longitude da cidade.
Depois, chama getWeather(latitude, longitude) para pegar o clima atual.
Exibe os resultados formatados na página.
Se ocorrer algum erro (ex.: cidade não encontrada), mostra uma mensagem amigável para o usuário.
*/