/**
 * @jest-environment jsdom
 */

import fetchMock from "jest-fetch-mock";
import "@testing-library/jest-dom";

fetchMock.enableMocks();

beforeEach(() => {
  // Cria o DOM antes de importar o script
  document.body.innerHTML = `
    <form id="weather-form">
      <input type="text" id="city" />
      <button type="submit">Buscar</button>
    </form>
    <div id="result"></div>
  `;

  fetchMock.resetMocks();
});

// Importa o script **após criar o DOM**
import "../assets/js/script.js";

describe("Teste de integração DOM + script.js", () => {

  test("Exibe dados no DOM quando API retorna corretamente", async () => {
    // Mock da API de coordenadas
    fetchMock.mockResponseOnce(
      JSON.stringify({
        results: [
          { latitude: -23.55, longitude: -46.63, name: "São Paulo", country: "BR" }
        ]
      })
    );

    // Mock da API de clima
    fetchMock.mockResponseOnce(
      JSON.stringify({
        current_weather: { temperature: 25, weathercode: 1 }
      })
    );

    // Preenche input e dispara submit
    document.querySelector("#city").value = "São Paulo";
    document.querySelector("#weather-form").dispatchEvent(new Event("submit"));

    // Aguarda os async do script
    await Promise.resolve();
    await Promise.resolve();

    const result = document.querySelector("#result").innerHTML;

    expect(result).toContain("São Paulo");
    expect(result).toContain("Temperatura");
    expect(result).toContain("25");
  });

  test("Exibe erro quando a API falha", async () => {
    fetchMock.mockRejectOnce(new Error("Erro na requisição"));

    document.querySelector("#city").value = "AAAAA";
    document.querySelector("#weather-form").dispatchEvent(new Event("submit"));

    await Promise.resolve();
    await Promise.resolve();

    const result = document.querySelector("#result").textContent;
    expect(result).toContain("Erro");
  });

});
