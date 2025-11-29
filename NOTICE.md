📜 NOTICE - Atribuições e Créditos de Terceiros
Weather Project utiliza componentes, bibliotecas e serviços de terceiros. Este arquivo lista todas as atribuições, créditos e informações de licenciamento conforme exigido por lei.

🌐 APIs e Serviços Externos
1. Open-Meteo API
Descrição: API de dados meteorológicos e geocodificação
Website: https://open-meteo.com
Licença: CC BY 4.0 (Creative Commons Attribution 4.0)
Uso no projeto:
Geocoding API: Conversão de nome de cidade em coordenadas
Weather Forecast API: Dados climáticos atuais e previsão
Atribuição requerida: ✅ Sim
Termos de uso: https://open-meteo.com/en/terms
Política de privacidade: https://open-meteo.com/en/terms#privacy
Atribuição:

Weather data provided by Open-Meteo.com
Licensed under CC BY 4.0
https://open-meteo.com
2. Google Fonts - Poppins
Descrição: Fonte tipográfica web
Website: https://fonts.google.com/specimen/Poppins
Licença: Open Font License (OFL)
Designer: Indian Type Foundry, Jonny Pinhorn
Uso no projeto: Tipografia principal da interface
Atribuição requerida: ✅ Sim (para redistribuição)
Termos: https://scripts.sil.org/OFL
Atribuição:

Font: Poppins
Designer: Indian Type Foundry, Jonny Pinhorn
License: SIL Open Font License 1.1
https://fonts.google.com/specimen/Poppins
3. Weather Icons
Descrição: Conjunto de ícones meteorológicos
Website: https://erikflowers.github.io/weather-icons/
Repositório: https://github.com/erikflowers/weather-icons
Licença: SIL OFL 1.1 (fontes) + MIT (código CSS)
Autor: Erik Flowers
Versão usada: 2.0.10
CDN: https://cdnjs.cloudflare.com
Uso no projeto: Ícones visuais de condições climáticas
Atribuição requerida: ✅ Sim
Atribuição:

Weather Icons v2.0.10
Created by Erik Flowers
Font License: SIL OFL 1.1
CSS License: MIT
https://erikflowers.github.io/weather-icons/
4. Cloudflare CDN
Descrição: Rede de distribuição de conteúdo
Website: https://www.cloudflare.com
Uso no projeto: Hospedagem de Weather Icons
Licença: Termos de Serviço da Cloudflare
Política de privacidade: https://www.cloudflare.com/privacypolicy/
📦 Dependências npm (Desenvolvimento)
5. Jest
Descrição: Framework de testes JavaScript
Website: https://jestjs.io
Repositório: https://github.com/facebook/jest
Licença: MIT
Versão: 29.7.0
Copyright: Facebook, Inc.
Uso no projeto: Testes unitários automatizados
Licença MIT - Facebook, Inc.

Copyright (c) Facebook, Inc. and its affiliates.
Licensed under MIT License
https://github.com/facebook/jest/blob/main/LICENSE
6. @types/jest
Descrição: Definições TypeScript para Jest
Repositório: https://github.com/DefinitelyTyped/DefinitelyTyped
Licença: MIT
Versão: 29.5.11
Mantido por: DefinitelyTyped Community
Licença MIT - DefinitelyTyped

Licensed under MIT License
https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE
🎨 Recursos Visuais e Design
7. Inspiração de Design
O design visual foi inspirado por:

Material Design (Google)
Fluent Design System (Microsoft)
Aplicações modernas de clima
Nota: Nenhum código ou recurso proprietário foi copiado. Apenas conceitos de UX/UI foram estudados e reimplementados de forma original.

📚 Conhecimento e Tutoriais
Este projeto foi desenvolvido com auxílio de:

MDN Web Docs (https://developer.mozilla.org)
W3Schools (https://www.w3schools.com)
Stack Overflow (https://stackoverflow.com)
Jest Documentation (https://jestjs.io/docs)
Open-Meteo Documentation (https://open-meteo.com/en/docs)
🤖 Assistência de IA
Durante o desenvolvimento deste projeto, foi utilizada assistência de:

Claude (Anthropic) - Auxílio em:
Estruturação de código
Documentação técnica
Resolução de problemas
Boas práticas de segurança
Nota: Todo o código foi revisado, testado e personalizado pelo desenvolvedor humano. A IA foi usada como ferramenta de suporte, não como autora do código.

🔍 Como Verificar Licenças de Dependências
Para verificar todas as licenças das dependências npm:

bash
# Instalar ferramenta
npm install -g license-checker

# Executar verificação
npx license-checker --summary

# Verificar em detalhes
npx license-checker --json > licenses.json
⚖️ Resumo de Licenças
Componente	Licença	Uso Comercial	Atribuição	Modificação
Open-Meteo API	CC BY 4.0	✅ Sim	✅ Obrigatória	✅ Permitida
Google Fonts (Poppins)	OFL 1.1	✅ Sim	✅ Recomendada	✅ Permitida
Weather Icons	SIL OFL 1.1 + MIT	✅ Sim	✅ Obrigatória	✅ Permitida
Jest	MIT	✅ Sim	⚠️ Recomendada	✅ Permitida
@types/jest	MIT	✅ Sim	⚠️ Recomendada	✅ Permitida
Legenda:

✅ Obrigatória: Deve incluir aviso de copyright/licença
⚠️ Recomendada: Boa prática, mas não obrigatória
✅ Permitida: Ação autorizada pela licença
📋 Obrigações de Atribuição
Quando distribuir este software, você DEVE:
✅ Incluir este arquivo NOTICE.md
✅ Incluir o arquivo LICENSE
✅ Manter avisos de copyright originais
✅ Creditar Open-Meteo nos dados climáticos exibidos
✅ Creditar Erik Flowers pelos Weather Icons (se modificar)
Sugestão de Atribuição na Interface:
html
<!-- Rodapé da aplicação -->
<footer>
  <p>Dados meteorológicos fornecidos por <a href="https://open-meteo.com">Open-Meteo.com</a></p>
  <p>Ícones por <a href="https://erikflowers.github.io/weather-icons/">Weather Icons</a></p>
</footer>
🚫 Marcas Registradas
As seguintes marcas são propriedade de seus respectivos donos:

"Open-Meteo" é marca da Open-Meteo
"Google Fonts" é marca da Google LLC
"Cloudflare" é marca da Cloudflare, Inc.
"Jest" é marca da Facebook, Inc.
Este projeto NÃO é afiliado, endossado ou patrocinado por nenhuma dessas empresas.

🔄 Atualizações deste Arquivo
Este arquivo deve ser atualizado sempre que:

✅ Uma nova dependência for adicionada
✅ Uma API de terceiros for integrada
✅ Recursos de terceiros forem incluídos
✅ Licenças de dependências mudarem
📞 Contato para Questões de Licenciamento
Se você tiver dúvidas sobre atribuições ou licenças:

Email: legal@exemplo.com
GitHub Issues: https://github.com/seu-usuario/weather-project/issues
Assunto: [LICENSING] Sua dúvida aqui
✅ Certificação de Conformidade
Declaração: O desenvolvedor deste projeto certifica que:

✅ Todas as licenças de terceiros foram respeitadas
✅ Atribuições obrigatórias foram incluídas
✅ Nenhum código proprietário foi utilizado sem autorização
✅ Este arquivo NOTICE.md lista todos os componentes de terceiros
✅ O projeto está em conformidade com as leis de copyright aplicáveis
Assinado:
Cíntia Dourado
Desenvolvedora - Weather Project
Data: 29 de Novembro de 2025

📚 Referências Legais
Creative Commons BY 4.0: https://creativecommons.org/licenses/by/4.0/
SIL Open Font License: https://scripts.sil.org/OFL
MIT License: https://opensource.org/licenses/MIT
Lei de Direitos Autorais (Brasil): Lei nº 9.610/1998
Última atualização: 29 de Novembro de 2025

Este arquivo faz parte do projeto Weather Project e está sujeito à licença MIT (veja LICENSE).

