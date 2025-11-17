// Este arquivo Testa funções lógicas + API -- mas nao testa o que envolve DOM

// tests/api.test.js
import { jest } from "@jest/globals";

import { getCoordinates, getWeather, getWeatherDescriptionAndIcon } from "../assets/js/api.js";

// Mock global.fetch
global.fetch = jest.fn();

describe("Funções de API - Clima", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  // ✔ Teste 1 — Cidade válida retorna dados. Confirma que:
    // a API de geocodificação funciona
    // a API de clima retorna temperatura e weathercode
  test("Nome de cidade válido retorna dados meteorológicos", async () => {
    // 1ª chamada fetch -> geocoding
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{ latitude: -23.55, longitude: -46.63, name: "São Paulo", country: "BR" }]
      })
    });

    const coords = await getCoordinates("São Paulo");
    expect(coords).toMatchObject({ name: "São Paulo", country: "BR" });

    // 2ª chamada fetch -> weather
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        current_weather: { temperature: 25, weathercode: 0, windspeed: 5, winddirection: 180, time: "2025-11-11T12:00" }
      })
    });

    const weather = await getWeather(coords.latitude, coords.longitude);
    expect(weather.temperature).toBeDefined();
    expect(weather.weathercode).toBeDefined();
  });

  // ✔ Teste 2 — Cidade inexistente dispara erro. Do tipo: Cidade não encontrada.
  test("Nome de cidade inexistente lança exceção", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] })
    });

    await expect(getCoordinates("CidadeInexistente")).rejects.toThrow("Cidade não encontrada.");
  });

  //✔ Teste 3 — Mapeamento do clima funciona. Confere se: 
    // código 0 → “Céu limpo” e ícone “wi-day-sunny”
    // código desconhecido → “Desconhecido” e “wi-na”
  test("Função getWeatherDescriptionAndIcon retorna descrição e ícone", () => {
    const { desc, icon } = getWeatherDescriptionAndIcon(0);
    expect(desc).toBe("Céu limpo");
    expect(icon).toBe("wi-day-sunny");

    const unknown = getWeatherDescriptionAndIcon(999);
    expect(unknown.desc).toBe("Desconhecido");
    expect(unknown.icon).toBe("wi-na");
  });

  //✔ Teste 4 — API com erro retorna exceção. Se o fetch retorna ok:false, deve lançar: Erro ao buscar coordenadas..
  test("Falha na API gera exceção", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({})
    });

    await expect(getCoordinates("São Paulo")).rejects.toThrow("Erro ao buscar coordenadas.");
  });
});
