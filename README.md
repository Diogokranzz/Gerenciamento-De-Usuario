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
```bash
npm run dev
```

4. Acesse o sistema no navegador:
```
http://localhost:5000
```

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

## Contribuição
Sinta-se à vontade para contribuir com este projeto! Abra uma issue ou envie um pull request com suas melhorias.
