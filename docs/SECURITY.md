# Segurança e privacidade

## Estado atual

O preview é uma demonstração sem autenticação ou backend real. Não deve receber informações pessoais, senhas, documentos ou capturas de sistemas municipais.

## Requisitos antes de produção

- autenticação corporativa ou credenciais com Argon2id;
- sessões seguras em cookies `HttpOnly`, `Secure` e `SameSite`;
- autorização por perfil, setor e recurso em toda operação da API;
- HTTPS obrigatório;
- limites de tipo e tamanho de anexos, validação e varredura antimalware;
- arquivos privados com URLs temporárias;
- logs de auditoria imutáveis para eventos relevantes;
- segredos fora do repositório;
- backups criptografados e testes de restauração;
- monitoramento, alertas e plano de resposta a incidentes;
- política de retenção e minimização de dados;
- revisão LGPD com encarregado e jurídico.

## Modelo de acesso inicial

| Perfil | Acesso |
|---|---|
| Servidor | próprios chamados e mensagens públicas |
| Técnico | fila autorizada, atendimento e notas internas |
| Administrador | configurações, usuários e relatórios autorizados |

## Relato responsável

Vulnerabilidades não devem ser publicadas em issues abertas. Enquanto não houver canal institucional, o responsável pelo repositório deve ser contatado de forma privada.
