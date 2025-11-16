# 🧁 Cupcake Store  
Projeto Integrador Transdisciplinar em Engenharia de Software II / Cruzeiro do Sul Virtual  

 Este é um projeto acadêmico desenvolvido para simular uma loja online de cupcakes para uma pequena confeitaria fictícia.  
 O objetivo é aplicar na prática os conceitos aprendidos no curso de Engenharia de Software, incluindo desenvolvimento front-end, back-end, persistência de dados, autenticação, gerenciamento de pedidos e organização de código.

🔥 Sinta-se à vontade para estudar, adaptar e contribuir com o código! 🔥

---

## 📄 Documentação

 Os arquivos de documentação da disciplina podem ser localizados na pasta "docs/".

 (PIT I, PIT II, laudo de qualidade, evidências de testes, prints, etc.) 

---

## 🔧 Pré-requisito: instalar Node.js

Acesse o site oficial:

```bash
https://nodejs.org
```

Baixe a versão LTS (recomendada) e execute o instalador.

Na instalação, mantenha marcada a opção de adicionar o Node.js ao PATH do sistema.

Após concluir, abra o Prompt de Comando ou PowerShell e teste:

```bash
node -v
npm -v
```

Se aparecerem as versões, o Node e o NPM estão instalados corretamente.

---

## Como rodar o projeto localmente?

Clone o repositório

```bash
git clone https://github.com/Ricardo-Bertolotti/cupcake-store.git
```

Acesse a pasta do projeto

```bash
cd cupcake-store/
```

Vá para a pasta do back-end

```bash
cd backend
```

Instale as dependências do back-end

```bash
npm install
```

Inicie o servidor back-end

```bash
node server.js
```

O servidor ficará disponível em http://localhost:3000.

Acesse o front-end

Abra o arquivo frontend/html/index.html diretamente no navegador

---

## 🛠️ Tecnologias utilizadas

**Back-end**
- Node.js  
- Express.js  
- SQLite3 (SQLite 3.44.3)  

**Front-end**
- HTML5  
- CSS3  
- JavaScript (vanilla)

**Ferramentas e conceitos**
- VS Code  
- Git e GitHub  
- Rotas REST  
- Middlewares de autenticação/autorização  
- LocalStorage para persistência no front-end  

---

## 📁 Árvore da estrutura do projeto

No diretório cupcake-store, utilize o comando "tree" para listar a árvore completa do projeto.

```bash
cd caminho_do_projeto/cupcake-store
tree /f 
```

Resuma da árvore do projeto:

<img width="304" height="837" alt="arvore" src="https://github.com/user-attachments/assets/a5484ff1-bda2-4a24-acc5-d05f7860341e" />


---

## 📁 Estrutura geral do projeto

- `backend/:` Contém o servidor Node.js (server.js), conexão com o banco e as rotas da API.

- `db/:` Arquivos do banco de dados (cupcake_store.db).

- `routes/:` Rotas da aplicação (usuários, produtos, carrinho, pedidos, cupons, admin etc.).

- `frontend/:` Parte visual da aplicação (loja, carrinho, login, admin).

- `assets/img/:` Imagens da loja e do painel admin (cupcakes, ícones, logo etc.).

- `css/:` Arquivos de estilo (style.css, style-admin.css e variações).

- `html/:` Páginas principais do site (home, login, carrinho, checkout, perfil, registro, histórico etc.).

- `html/admin/:` Páginas do painel administrativo (dashboard, produtos, usuários, cupons, histórico).

- `js/:` Scripts de front-end que controlam a lógica das telas (loja, carrinho, login, perfil, registro, etc.).

- `js/admin/:` Scripts específicos do painel admin (dashboard, produtos, usuários, cupons, histórico).

- `docs/:` Documentação do projeto (PIT, laudo de qualidade, anexos, prints e relatórios).

- `node_modules/:` Dependências instaladas via npm (gerenciado automaticamente).

- `package.json / package-lock.json:` Metadados do projeto e lista de dependências do Node.js.

---

## 🎯 Funcionalidades principais

**Área pública**
- Listagem de produtos (vitrine de cupcakes)  
- Detalhes do produto  
- Adicionar/remover itens do carrinho  
- Aplicar cupom de desconto  
- Cálculo de subtotal, frete fixo e total  

**Usuário autenticado**
- Criar conta e fazer login  
- Atualizar dados de perfil e endereço  
- Visualizar histórico de pedidos  
- Favoritar e desfavoritar produtos  
- Acompanhar status dos pedidos  

**Área administrativa**
- Gerenciar produtos (criar, editar, desativar, excluir)  
- Gerenciar estoque  
- Gerenciar usuários  
- Gerenciar cupons de desconto  
- Visualizar dados gerais no painel administrativo  

---

## 👨‍💻 Autoria

 Este projeto foi desenvolvido por **Ricardo Aparecido Santos Bertolotti**  
como parte do Projeto Integrador Transdisciplinar em Engenharia de Software II
pela Universidade de ensino Cruzeiro do Sul Virtual.

Perfil principal:
[GitHub: https://github.com/Ricardo-Bertolotti  ](https://github.com/Ricardo-Bertolotti)

---

## 🖼️ Imagens

**Loja (vitrine de cupcakes)**  

<img width="1868" height="841" alt="loja" src="https://github.com/user-attachments/assets/773fa18c-d580-4b18-83f5-75de54fc2cbe" />


**Painel administrativo**  

<img width="1862" height="758" alt="admin" src="https://github.com/user-attachments/assets/27acafa1-fb42-4774-ace3-b9145c559ca5" />

---

Este repositório representa a versão utilizada para avaliação da disciplina, já com correções e melhorias aplicadas a partir dos testes de usuários e do laudo de qualidade.
