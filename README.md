# Bédia Quadrinhos

Site com backend em Python (Flask). Os dados (mangás e capítulos) ficam em `data.json` e são servidos pela API.

## Como correr o site

1. Instala o Python (se ainda não tiveres) e abre a pasta do projeto no terminal.

2. Cria um ambiente virtual (opcional mas recomendado):
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

3. Instala as dependências:
   ```bash
   pip install -r requirements.txt
   ```

4. Inicia o servidor:
   ```bash
   python app.py
   ```

5. Abre o browser em **http://127.0.0.1:5000**

## O que o Python faz

- **API GET /api/mangas** – devolve a lista de mangás (lida de `data.json`).
- **API GET /api/capitulos** – devolve a lista de capítulos.
- **API POST /api/mangas** – adiciona um novo mangá (nome + capa); o botão "Adicionar Mangá" no site usa isto.
- **API POST /api/capitulos** – adiciona um novo capítulo (para uso futuro ou ferramentas).
- Serve o site (HTML, CSS, JS, imagens e PDFs) na mesma pasta.

Para editar mangás ou capítulos manualmente, altera o ficheiro `data.json`.
