# Roadmap

## Marco 0 — Descoberta e protótipo ✅

Requisitos, jornadas, identidade visual, fluxo completo demonstrativo e preview responsivo.

## Marco 1 — Fundação do produto

- API FastAPI e PostgreSQL;
- migrations com Alembic;
- modelos de usuários, setores, categorias, chamados, mensagens e eventos;
- configuração por ambiente;
- pipeline de testes e análise estática.

## Marco 2 — MVP integrado

- autenticação;
- autorização por perfil e recurso;
- integração React/API;
- criação, fila, atribuição, status, mensagens e resolução;
- auditoria automática;
- anexos privados;
- notificações por e-mail.

## Marco 3 — Homologação

- testes de regras, integração e ponta a ponta;
- revisão WCAG 2.2 AA e eMAG;
- revisão de segurança e privacidade;
- backup e restauração;
- staging e observabilidade;
- teste com servidores e técnicos.

## Marco 4 — Piloto controlado

Piloto em uma ou duas secretarias, com métricas de tempo de abertura, qualidade das informações, primeira resposta, resolução, reabertura e satisfação.

## Decisões externas necessárias

1. Método de autenticação disponível (AD/LDAP, SSO ou credenciais locais).
2. Hospedagem própria ou nuvem contratada.
3. Acesso apenas interno, VPN ou internet.
4. Lista oficial de secretarias, setores e técnicos.
5. Serviço institucional de e-mail.
6. Política de backup, retenção e anexos.
