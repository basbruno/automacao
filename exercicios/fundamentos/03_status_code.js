// PDF, página 14: escreva uma condição que verifica se o status é 200.
// TODO: execute também com 201, 404 e 500 e observe a diferença.
const statusCode = 200;

if (statusCode === 200) {
  console.log('PASS');
} else {
  console.log('FAIL: status ' + statusCode);
}
