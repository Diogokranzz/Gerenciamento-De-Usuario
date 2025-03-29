# Sistema de Gerenciamento de Usuários

## Descrição
Sistema completo de gerenciamento de usuários com interface web, utilizando animações e design 3D. O sistema inclui gerenciamento de cadastro, persistência de dados local e funcionalidades avançadas de administração.

## Funcionalidades
- Autenticação e controle de acesso
- Gerenciamento de usuários (criar, editar, bloquear, excluir)
- Criação e gerenciamento de grupos
- Sistema de permissões granular
- Registro de atividades com histórico
- Dashboard com estatísticas e gráficos
- Interface com animações e elementos 3D
- Personalização de temas (claro/escuro, cores, animações)
- Proteções de segurança avançadas

## Tecnologias
- Frontend: React, TailwindCSS, Framer Motion, React Query
- Backend: Node.js, Express, Passport
- Armazenamento: Persistência local em memória
- Controle de tipos: TypeScript
- Validação: Zod

## Como executar o projeto

### Requisitos
- Node.js (versão 16 ou superior)
- npm (gerenciador de pacotes)

### Instalação
1. Clone este repositório:
```bash
git clone https://github.com/Diogokranzz/Gerenciamento-De-Usuario.git
cd Gerenciamento-De-Usuario
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie a aplicação:

Método padrão:
```bash
npm run dev
```

Se encontrar problemas com a porta 5000 (erro ENOTSUP ou EADDRINUSE), use o script auxiliar:
```bash
node start-local.js
```

4. Acesse o sistema no navegador:
```
http://localhost:5000
```
(ou na porta alternativa indicada pelo script auxiliar)

## Credenciais de acesso
O sistema é inicializado com um usuário administrador padrão:
- Usuário: `admin`
- Senha: `admin123`

## Estrutura do projeto
- `client/` - Frontend em React/TypeScript
- `server/` - Backend em Node.js/Express
- `shared/` - Tipos e schemas compartilhados

## Funcionalidades de segurança
- Senhas armazenadas com hash criptográfico
- Proteção contra exclusão do administrador principal
- Validação de dados em todas as operações
- Controle de sessão seguro

## Solução de Problemas

### Erro ao iniciar o servidor
Se você encontrar erros como `ENOTSUP: operation not supported on socket` ou `EADDRINUSE: address already in use`, tente:

1. Use o script auxiliar que detecta automaticamente portas disponíveis:
   ```bash
   node start-local.js
   ```

2. Execute com uma porta específica definida manualmente:
   ```bash
   PORT=3000 npm run dev
   ```

3. Verifique e encerre processos usando a porta 5000:
   - No Windows: `netstat -ano | findstr :5000`
   - No Linux/Mac: `lsof -i :5000`

### Outros problemas
- Certifique-se de ter a versão do Node.js compatível (16+)
- Se houver erros de módulos não encontrados, tente `npm install` novamente
- Para erros de compilação, verifique se o TypeScript está instalado corretamente

## Contribuição
Sinta-se à vontade para contribuir com este projeto! Abra uma issue ou envie um pull request com suas melhorias.
