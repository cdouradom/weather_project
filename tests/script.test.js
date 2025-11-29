// ---------------------------------------------------------
// 1. Criar mocks mínimos de DOM ANTES de importar script.js
// ---------------------------------------------------------
global.document = {
  getElementById: () => ({
    value: "",
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {} },
    focus: () => {}
  }),
  body: { style: {} }
};

global.window = {
  addEventListener: () => {}
};

// ---------------------------------------------------------
// 2. Agora podemos importar o script.js sem erro
// ---------------------------------------------------------
const { getCoordinates, getWeather } = require("../assets/js/script.js");

// ---------------------------------------------------------
// 3. Mock do fetch antes de cada teste
// ---------------------------------------------------------
beforeEach(() => {
  global.fetch = jest.fn();
});

// ---------------------------------------------------------
// 4. Testes atualizados para refletir novas variáveis
// ---------------------------------------------------------

// 1. Cidade válida retorna dados completos
test("Cidade válida retorna coordenadas e clima completo", async () => {
  const mockGeo = {
    results: [{ lat: -23.5, lon: -46.6, name: "São Paulo", country: "BR" }]
  };

  const mockWeather = {
    current_weather: {
      temperature: 22,
      weathercode: 1,
      windspeed: 15,
      time: "2025-11-28T15:00"
    },
    hourly: {
      relativehumidity_2m: [60],
      precipitation: [0.8]
    }
  };

  // Geocoder
  fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(mockGeo)
  });
  const coords = await getCoordinates("São Paulo");

  expect(coords.lat).toBe(-23.5);
  expect(coords.lon).toBe(-46.6);

  // Clima completo
  fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(mockWeather)
  });

  const weather = await getWeather(-23.5, -46.6);

  expect(weather.temperature).toBe(22);
});

// 2. Cidade inexistente lança exceção tratada
test("Cidade inexistente lança erro", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ results: [] })
  });

  await expect(getCoordinates("CidadeInexistente"))
    .rejects.toThrow("Cidade não encontrada");
});

// 3. Entrada vazia retorna erro de validação
test("Entrada vazia lança erro", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ results: [] })
  });

  await expect(getCoordinates(""))
    .rejects.toThrow("Cidade não encontrada");
});

// 4. Falha da API gera erro adequado
test("Falha da API gera erro", async () => {
  fetch.mockResolvedValueOnce({ ok: false });

  await expect(getCoordinates("São Paulo"))
    .rejects.toThrow("Erro na requisição de geocodificação.");
});

// 5. Erro 429 tratado como falha da API
test("Erro 429 tratado como falha da API", async () => {
  fetch.mockResolvedValueOnce({ ok: false, status: 429 });

  await expect(getCoordinates("São Paulo"))
    .rejects.toThrow("Erro na requisição de geocodificação.");
});

// 6. Erro de rede tratado
test("Erro de rede é tratado", async () => {
  fetch.mockRejectedValueOnce(new Error("Network error"));

  await expect(getCoordinates("Rio de Janeiro"))
    .rejects.toThrow("Network error");
});

// 7. JSON inesperado
test("JSON inesperado lança erro", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ foo: "bar" })
  });

  await expect(getCoordinates("São Paulo"))
    .rejects.toThrow("Cidade não encontrada");
});

// 8. Weather com JSON incompleto
test("Clima com JSON incompleto lança erro", async () => {
  fetch
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        results: [{ lat: 1, lon: 1 }]
      })
    })
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ current_weather: {} }) // Sem dados essenciais
    });

  await expect(getWeather(1, 1))
    .rejects.toThrow();
});
