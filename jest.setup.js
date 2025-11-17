import fetchMock from "jest-fetch-mock";
import "@testing-library/jest-dom";

fetchMock.enableMocks();

beforeEach(() => {
  // Limpa DOM somente se existir
  if (typeof document !== "undefined" && document.body) {
    document.body.innerHTML = "";
  }
  fetchMock.resetMocks();
});
