// ---------------------------------------------------------
// 1. Criar mocks mínimos de DOM ANTES de importar script.js
// ---------------------------------------------------------
global.document = {
  getElementById: () => ({
    value: "",
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {} },
    focus: () => {},
    style: {}
  }),
  body: { style: {} },
  querySelector: () => ({
    classList: { remove: () => {}, add: () => {} },
    innerHTML: ""
  }),
  createElement: () => ({
    style: {},
    className: "",
    innerHTML: "",
    appendChild: () => {},
    remove: () => {},
    dataset: {}
  }),
  head: { appendChild: () => {} }
};

global.window = {
  addEventListener: () => {},
  innerHeight: 800
};

// ---------------------------------------------------------
// 2. Agora podemos importar o script.js sem erro
// ---------------------------------------------------------
const { getCoordinates, getWeather, getForecast } = require("../assets/js/script.js");

// ---------------------------------------------------------
// 3. Mock do fetch antes de cada teste
// ---------------------------------------------------------
beforeEach(() => {
  global.fetch = jest.fn();
  jest.clearAllMocks();
});

// ---------------------------------------------------------
// 4. TESTES DE getCoordinates
// ---------------------------------------------------------

describe("getCoordinates - Testes de Geocodificação", () => {
  test("Cidade válida retorna coordenadas completas", async () => {
    const mockGeo = {
      results: [
        { 
          latitude: -23.5505, 
          longitude: -46.6333, 
          name: "São Paulo", 
          country: "Brazil" 
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGeo)
    });

    const coords = await getCoordinates("São Paulo");

    expect(coords.latitude).toBe(-23.5505);
    expect(coords.longitude).toBe(-46.6333);
    expect(coords.name).toBe("São Paulo");
    expect(coords.country).toBe("Brazil");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("geocoding-api.open-meteo.com")
    );
  });

  test("Cidade inexistente lança erro", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ results: [] })
    });

    await expect(getCoordinates("CidadeInexistente123"))
      .rejects.toThrow("Cidade não encontrada.");
  });

  test("Entrada vazia retorna erro", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ results: [] })
    });

    await expect(getCoordinates(""))
      .rejects.toThrow("Cidade não encontrada.");
  });

  test("Falha da API gera erro adequado", async () => {
    fetch.mockResolvedValueOnce({ 
      ok: false,
      status: 500 
    });

    await expect(getCoordinates("São Paulo"))
      .rejects.toThrow("Erro na requisição de geocodificação.");
  });

  test("Erro 429 (rate limit) tratado como falha da API", async () => {
    fetch.mockResolvedValueOnce({ 
      ok: false, 
      status: 429 
    });

    await expect(getCoordinates("São Paulo"))
      .rejects.toThrow("Erro na requisição de geocodificação.");
  });

  test("Erro de rede é tratado", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(getCoordinates("Rio de Janeiro"))
      .rejects.toThrow("Network error");
  });

  test("JSON inesperado (sem results) lança erro", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ foo: "bar" })
    });

    await expect(getCoordinates("São Paulo"))
      .rejects.toThrow("Cidade não encontrada.");
  });

  test("Cidade com caracteres especiais é codificada corretamente", async () => {
    const mockGeo = {
      results: [
        { 
          latitude: 48.8566, 
          longitude: 2.3522, 
          name: "Paris", 
          country: "France" 
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGeo)
    });

    await getCoordinates("São Paulo & Região");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent("São Paulo & Região"))
    );
  });
});

// ---------------------------------------------------------
// 5. TESTES DE getWeather
// ---------------------------------------------------------

describe("getWeather - Testes de Dados Climáticos", () => {
  test("Retorna dados climáticos completos com umidade e precipitação", async () => {
    const mockWeather = {
      current_weather: {
        temperature: 22.5,
        weathercode: 1,
        windspeed: 15.3,
        time: "2025-11-28T15:00"
      },
      hourly: {
        time: ["2025-11-28T15:00"],
        relativehumidity_2m: [65],
        precipitation: [0.8],
        windspeed_10m: [15.3]
      },
      utc_offset_seconds: -10800
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockWeather)
    });

    const weather = await getWeather(-23.5, -46.6);

    expect(weather.temperature).toBe(22.5);
    expect(weather.weathercode).toBe(1);
    expect(weather.windspeed).toBe(15.3);
    expect(weather.humidity).toBe(65);
    expect(weather.precipitation).toBe(0.8);
    expect(weather.windspeed_hourly).toBe(15.3);
    expect(weather.windspeed_from_current).toBe(15.3);
    expect(weather.timezone_offset).toBe(-10800);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test("Retorna dados mesmo sem hourly (umidade e precipitação null)", async () => {
    const mockWeather = {
      current_weather: {
        temperature: 18.0,
        weathercode: 3,
        windspeed: 10.5,
        time: "2025-11-28T10:00"
      },
      utc_offset_seconds: 0
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockWeather)
    });

    const weather = await getWeather(51.5, -0.1);

    expect(weather.temperature).toBe(18.0);
    expect(weather.humidity).toBeNull();
    expect(weather.precipitation).toBeNull();
    expect(weather.windspeed_from_current).toBe(10.5);
  });

  test("Clima sem current_weather lança erro", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ hourly: {} })
    });

    await expect(getWeather(1, 1))
      .rejects.toThrow("Dados de clima atual indisponíveis.");
  });

  test("Falha da API de clima gera erro", async () => {
    fetch.mockResolvedValueOnce({ 
      ok: false,
      status: 503 
    });

    await expect(getWeather(-23.5, -46.6))
      .rejects.toThrow("Erro na requisição de clima.");
  });

  test("Busca índice mais próximo quando time exato não existe", async () => {
    const mockWeather = {
      current_weather: {
        temperature: 20,
        weathercode: 0,
        windspeed: 5,
        time: "2025-11-28T14:30"
      },
      hourly: {
        time: ["2025-11-28T14:00", "2025-11-28T15:00"],
        relativehumidity_2m: [70, 68],
        precipitation: [0, 0.2],
        windspeed_10m: [5, 6]
      },
      utc_offset_seconds: 0
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockWeather)
    });

    const weather = await getWeather(0, 0);

    // Deve encontrar o índice mais próximo (14:00)
    expect(weather.humidity).toBe(70);
    expect(weather.precipitation).toBe(0);
  });

  test("Retorna dados raw completos", async () => {
    const mockWeather = {
      current_weather: {
        temperature: 25,
        weathercode: 61,
        windspeed: 20,
        time: "2025-11-28T12:00"
      },
      utc_offset_seconds: 3600
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockWeather)
    });

    const weather = await getWeather(40.7, -74.0);

    expect(weather.raw).toEqual(mockWeather);
  });
});

// ---------------------------------------------------------
// 6. TESTES DE getForecast
// ---------------------------------------------------------

describe("getForecast - Testes de Previsão do Tempo", () => {
  test("Retorna previsão dos próximos dias", async () => {
    const mockForecast = {
      daily: {
        time: [
          "2025-11-28",
          "2025-11-29",
          "2025-11-30",
          "2025-12-01",
          "2025-12-02"
        ],
        temperature_2m_max: [28, 30, 27, 26, 29],
        temperature_2m_min: [18, 19, 17, 16, 18],
        precipitation_sum: [0, 2.5, 0, 0, 1.2]
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockForecast)
    });

    const forecast = await getForecast(-23.5, -46.6);

    expect(forecast.time).toHaveLength(5);
    expect(forecast.temperature_2m_max[0]).toBe(28);
    expect(forecast.temperature_2m_min[0]).toBe(18);
    expect(forecast.precipitation_sum[1]).toBe(2.5);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("daily=temperature_2m_max,temperature_2m_min,precipitation_sum")
    );
  });

  test("Falha da API de previsão gera erro", async () => {
    fetch.mockResolvedValueOnce({ 
      ok: false,
      status: 500 
    });

    await expect(getForecast(10, 20))
      .rejects.toThrow("Erro ao buscar previsão.");
  });

  test("Previsão com dados incompletos é retornada", async () => {
    const mockForecast = {
      daily: {
        time: ["2025-11-28"],
        temperature_2m_max: [25],
        temperature_2m_min: [15]
        // sem precipitation_sum
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockForecast)
    });

    const forecast = await getForecast(0, 0);

    expect(forecast.time).toHaveLength(1);
    expect(forecast.temperature_2m_max[0]).toBe(25);
    expect(forecast.precipitation_sum).toBeUndefined();
  });

  test("Erro de timeout é tratado", async () => {
    fetch.mockRejectedValueOnce(new Error("Request timeout"));

    await expect(getForecast(35.6, 139.6))
      .rejects.toThrow("Request timeout");
  });
});

// ---------------------------------------------------------
// 7. TESTES DE INTEGRAÇÃO (Múltiplas chamadas de API)
// ---------------------------------------------------------

describe("Integração - Fluxo completo de busca", () => {
  test("Fluxo completo: geocoding + weather + forecast", async () => {
    const mockGeo = {
      results: [{ 
        latitude: 40.7128, 
        longitude: -74.0060, 
        name: "New York", 
        country: "USA" 
      }]
    };

    const mockWeather = {
      current_weather: {
        temperature: 15,
        weathercode: 2,
        windspeed: 12,
        time: "2025-11-28T10:00"
      },
      hourly: {
        time: ["2025-11-28T10:00"],
        relativehumidity_2m: [55],
        precipitation: [0],
        windspeed_10m: [12]
      },
      utc_offset_seconds: -18000
    };

    const mockForecast = {
      daily: {
        time: ["2025-11-28", "2025-11-29"],
        temperature_2m_max: [18, 20],
        temperature_2m_min: [10, 12],
        precipitation_sum: [0, 0.5]
      }
    };

    // Simular 3 chamadas sucessivas
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGeo)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWeather)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockForecast)
      });

    // 1. Buscar coordenadas
    const coords = await getCoordinates("New York");
    expect(coords.name).toBe("New York");

    // 2. Buscar clima
    const weather = await getWeather(coords.latitude, coords.longitude);
    expect(weather.temperature).toBe(15);
    expect(weather.humidity).toBe(55);

    // 3. Buscar previsão
    const forecast = await getForecast(coords.latitude, coords.longitude);
    expect(forecast.time).toHaveLength(2);
    expect(forecast.temperature_2m_max[1]).toBe(20);

    // Verificar que todas as 3 chamadas foram feitas
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  test("Falha na primeira chamada interrompe o fluxo", async () => {
    fetch.mockResolvedValueOnce({ ok: false });

    await expect(getCoordinates("InvalidCity"))
      .rejects.toThrow("Erro na requisição de geocodificação.");

    // Não deve prosseguir para as próximas chamadas
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------
// 8. TESTES DE EDGE CASES
// ---------------------------------------------------------

describe("Edge Cases - Casos extremos", () => {
  test("Coordenadas extremas (Polo Norte)", async () => {
    const mockWeather = {
      current_weather: {
        temperature: -30,
        weathercode: 71,
        windspeed: 50,
        time: "2025-11-28T00:00"
      },
      utc_offset_seconds: 0
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockWeather)
    });

    const weather = await getWeather(90, 0);

    expect(weather.temperature).toBe(-30);
    expect(weather.weathercode).toBe(71);
  });

  test("Temperatura muito alta (deserto)", async () => {
    const mockWeather = {
      current_weather: {
        temperature: 52.5,
        weathercode: 0,
        windspeed: 3,
        time: "2025-11-28T14:00"
      },
      utc_offset_seconds: 14400
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockWeather)
    });

    const weather = await getWeather(25.2, 55.3);

    expect(weather.temperature).toBe(52.5);
  });

  test("Vento extremamente forte (furacão)", async () => {
    const mockWeather = {
      current_weather: {
        temperature: 26,
        weathercode: 95,
        windspeed: 250,
        time: "2025-11-28T12:00"
      },
      hourly: {
        time: ["2025-11-28T12:00"],
        relativehumidity_2m: [90],
        precipitation: [150],
        windspeed_10m: [250]
      },
      utc_offset_seconds: -18000
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockWeather)
    });

    const weather = await getWeather(25.7, -80.2);

    expect(weather.windspeed_from_current).toBe(250);
    expect(weather.precipitation).toBe(150);
  });

  test("Cidade com nome muito longo", async () => {
    const longName = "A".repeat(200);
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ results: [] })
    });

    await expect(getCoordinates(longName))
      .rejects.toThrow("Cidade não encontrada.");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(longName))
    );
  });
});