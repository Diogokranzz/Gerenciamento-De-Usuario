const { spawn } = require('child_process');
const net = require('net');

// Função para verificar se uma porta está disponível
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false); // Porta em uso
      } else {
        resolve(false); // Outro erro
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true); // Porta disponível
    });
    
    server.listen(port, 'localhost');
  });
}

// Função para encontrar uma porta disponível
async function findAvailablePort(startPort, endPort) {
  for (let port = startPort; port <= endPort; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  return null; // Nenhuma porta disponível
}

async function startServer() {
  console.log('Verificando portas disponíveis...');
  
  // Verifica se a porta padrão (5000) está disponível
  if (await isPortAvailable(5000)) {
    console.log('A porta 5000 está disponível! Iniciando o servidor...');
    
    // Inicia o servidor na porta padrão
    const server = spawn('npm', ['run', 'dev'], { 
      stdio: 'inherit',
      shell: true
    });
    
    return;
  }
  
  // Tenta encontrar uma porta alternativa entre 3000 e 9000
  const availablePort = await findAvailablePort(3000, 9000);
  
  if (availablePort) {
    console.log(`A porta 5000 está em uso. Usando a porta alternativa ${availablePort}.`);
    console.log('Ajustando o servidor para usar a nova porta...');
    
    // Cria uma variável de ambiente PORT para ser usada pelo servidor
    process.env.PORT = availablePort;
    
    // Inicia o servidor com a nova porta
    const server = spawn('npm', ['run', 'dev'], { 
      stdio: 'inherit',
      shell: true,
      env: {...process.env}
    });
    
    return;
  }
  
  console.error('Não foi possível encontrar uma porta disponível entre 3000 e 9000.');
  console.error('Por favor, verifique os processos em execução e encerre algum serviço que esteja usando estas portas.');
}

startServer();