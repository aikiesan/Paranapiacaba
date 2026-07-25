import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');

const pkg = JSON.parse(read('package.json'));
const viteConfig = read('vite.config.js');
const indexHtml = read('index.html');

describe('configuração de publicação no GitHub Pages', () => {
  it('declara o subcaminho do site em `homepage`', () => {
    expect(pkg.homepage).toMatch(/^https:\/\/[^/]+\/[^/]+$/);
  });

  // O site é servido em https://<user>.github.io/<repo>/, então o `base` do
  // Vite precisa casar com o caminho do repositório — caso contrário todos os
  // assets do bundle resolvem para a raiz do domínio e retornam 404.
  it('mantém o `base` do Vite alinhado ao caminho de `homepage`', () => {
    const declared = viteConfig.match(/base:\s*['"]([^'"]+)['"]/);
    expect(declared, 'vite.config.js deve declarar um `base`').not.toBeNull();

    const expected = `${new URL(pkg.homepage).pathname.replace(/\/$/, '')}/`;
    expect(declared[1]).toBe(expected);
  });

  it('não referencia assets locais por caminho absoluto no index.html', () => {
    const absolute = [...indexHtml.matchAll(/(?:href|src)="(\/[^/][^"]*)"/g)]
      .map((match) => match[1])
      // O entrypoint do módulo é reescrito pelo Vite durante o build.
      .filter((value) => value !== '/src/main.jsx');

    expect(absolute).toEqual([]);
  });

  it('roda os testes antes de publicar', () => {
    const workflow = read('.github/workflows/deploy.yml');
    expect(workflow).toContain('npm test');
  });
});
