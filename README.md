# ❄️ Freezer -80°C | Sistema de Inventário & Tags QR-Code (LaPAM · ICB-USP)

Sistema visual e intuitivo para controle de inventário, mapeamento físico de coordenadas e emissão instantânea de etiquetas adesivas com QR-Code para o novo Freezer -80°C do **LaPAM** (Laboratório de Pesquisa Aplicada a Micobactérias — ICB II / USP).

Desenvolvido para ser acessível tanto por pesquisadores familiarizados com bioinformática quanto por membros focados exclusivamente na bancada experimental.

---

## 🧊 Especificações Físicas do Equipamento

- **Equipamento**: Freezer Vertical Ultra-Low Temperature (-80.0 °C)
- **Localização**: ICB II - USP, Sala de Micobacteriologia
- **Estrutura**:
  - **4 Gavetas modulares** (Gaveta 1 ao topo até Gaveta 4 na base)
  - **Matriz de cada gaveta**: 4 Linhas × 5 Colunas = **20 vagas de caixas**
  - **Orientação Física Realista**: Linha 1 na frente (porta / puxador da gaveta) e Linha 4 no fundo
  - **Capacidade Total**: **80 caixas** criogênicas (20 por gaveta)
- **Notação de Coordenadas**:
  - Padrão Nacional: `G{gaveta}-L{linha}-C{coluna}` (Ex: `G1-L2-C3` = Gaveta 1, Linha 2, Coluna 3)
  - Padrão Internacional: `D{drawer}-R{row}-C{column}` (Ex: `D1-R2-C3`)

---

## ✨ Principais Funcionalidades

1. **Visão Visual do Freezer & Matriz 4x5**:
   - Representação interativa do painel frontal e das 4 gavetas verticais.
   - Grade 4x5 com identificação rápida de vagas ocupadas e livres.
   - Destaque dinâmico em tempo real para busca de cepas, responsáveis, buffers, tags e níveis de biossegurança.

2. **Reivindicação de Gavetas & Posicionamento Individual / Coletivo**:
   - Possibilidade de configurar gavetas com foco temático ou responsáveis específicos (ex: *Estoques H37Rv / WGS*, *Extrações de DNA/RNA*, *MNT & BCG*, *Coletivo LaPAM*).
   - Cadastro flexível de caixas atribuídas a qualquer membro do laboratório ou à comunidade.

3. **Gerador de Etiquetas Inteligentes com QR-Code**:
   - Cada caixa cadastrada gera automaticamente um QR-Code vetorial com deep link direto para sua ficha técnica.
   - **Módulo de Impressão de Etiquetas**: Formatação pré-configurada para impressão em etiquetas adesivas de tampa e lateral de caixas (inclui QR-Code nítido, coordenadas em destaque `G1-L2-C3`, título, responsável, data e selo de biossegurança).
   - Permite impressão individual ou em lote por gaveta.

4. **Sincronização em Tempo Real (Supabase / PostgreSQL) & Portabilidade**:
   - Sincronização multi-dispositivo instantânea em tempo real via WebSockets.
   - **Exportação (CSV / Excel)** para relatórios, cadernos de laboratório e planilhas.
   - **Exportação & Importação Completa (JSON)** com upload em lote para a nuvem.
   - Modo offline com persistência automática no `localStorage`.

5. **Leitor de QR-Code & Busca Rápida**:
   - Leitor via câmera do celular ou notebook diretamente no navegador.
   - Ao escanear o QR colado na caixa física, o sistema abre instantaneamente todos os dados da amostra.
   - Campo para salto direto por coordenada (ex: digitar `D1-R2-C3`).

6. **Biossegurança Integrada**:
   - Classificação com alertas visuais: **NB-3 (BSL-3)** (*M. tuberculosis*, *M. bovis*), **NB-2 (BSL-2)** (*BCG*, *MNT*) e **Geral/NB-1** (*DNA, Primers, Reagentes*).

7. **Design 100% Integrado ao Portal LaPAM**:
   - Tipografia (*Plus Jakarta Sans* e *JetBrains Mono*), paleta de cores (Slate, Sky, Teal, Emerald) e animação de fundo *BioCanvas* idênticas ao portal oficial do laboratório.
   - Suporte bilíngue completo (Português / Inglês).

---

## ☁️ Como Configurar a Sincronização com Supabase (2 minutos)

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. No menu **SQL Editor**, copie e execute todo o conteúdo do arquivo [`supabase_schema.sql`](file:///home/falat/Repositories/freezer/supabase_schema.sql).
3. No sistema web do Freezer, clique no ícone **Modo Local / Configurar Nuvem** e cole a **Project URL** e a **Anon Key** (obtidas em *Project Settings → API*).
4. Clique em **Enviar / Atualizar Dados Locais para o Supabase** para popular as caixas iniciais. Pronto! Todos os computadores e celulares conectados estarão sincronizados em tempo real.

---

## 🚀 Como Executar Localmente

```bash
# Clone o repositório
git clone https://github.com/LaPAM-USP/freezer.git
cd freezer

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse no navegador em `http://localhost:3001` (ou na porta indicada pelo Vite).

---

## 📦 Build para Produção & GitHub Pages

```bash
# Gerar os arquivos otimizados em /dist
npm run build

# Pré-visualizar localmente a versão final
npm run preview
```

O repositório já inclui o fluxo automatizado do GitHub Actions em `.github/workflows/deploy.yml` para publicação automática no GitHub Pages a cada commit na branch `main`.

---

## 🏛️ Créditos & Realização

- **Laboratório**: LaPAM — Laboratório de Pesquisa Aplicada a Micobactérias
- **Instituição**: Departamento de Microbiologia, ICB II — Universidade de São Paulo (USP)
- **Coordenadora**: Prof.ª Dra. Ana Marcia de Sá Guimarães
- **Desenvolvimento**: Falat Labs ([falatfernando.github.io](https://falatfernando.github.io))
