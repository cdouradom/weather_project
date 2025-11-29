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
// 4. Testes solicitados
// ---------------------------------------------------------

// 1. Cidade válida retorna dados meteorológicos
test("Cidade válida retorna coordenadas e clima", async () => {
  const mockGeo = { results: [{ lat: -23.5, lon: -46.6 }] };
  const mockWeather = { current_weather: { temperature: 22, weathercode: 1 } };

  fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockGeo) });
  const coords = await getCoordinates("São Paulo");
  expect(coords.lat).toBe(-23.5);

  fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockWeather) });
  const weather = await getWeather(-23.5, -46.6);
  expect(weather.temperature).toBe(22);
});

// 2. Cidade inexistente lança exceção tratada
test("Cidade inexistente lança erro", async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ results: [] }) });
  await expect(getCoordinates("CidadeInexistente"))
    .rejects.toThrow("Cidade não encontrada");
});

// 3. Entrada vazia retorna erro de validação
test("Entrada vazia lança erro", async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ results: [] }) });
  await expect(getCoordinates(""))
    .rejects.toThrow("Cidade não encontrada");
});

// 4. Falha da API gera erro adequado
test("Falha da API gera erro", async () => {
  fetch.mockResolvedValueOnce({ ok: false });
  await expect(getCoordinates("São Paulo"))
    .rejects.toThrow("Erro na requisição de geocodificação.");
});

// Adicional — limite de requisições excedido (429)
test("Erro 429 tratado como falha da API", async () => {
  fetch.mockResolvedValueOnce({ ok: false, status: 429 });
  await expect(getCoordinates("São Paulo"))
    .rejects.toThrow("Erro na requisição de geocodificação.");
});

// Adicional — conexão instável / erro de rede
test("Erro de rede é tratado", async () => {
  fetch.mockRejectedValueOnce(new Error("Network error"));
  await expect(getCoordinates("Rio de Janeiro"))
    .rejects.toThrow("Network error");
});

// Adicional — JSON inesperado
test("JSON inesperado lança erro", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ foo: "bar" })
  });

  await expect(getCoordinates("São Paulo"))
    .rejects.toThrow("Cidade não encontrada");
});
