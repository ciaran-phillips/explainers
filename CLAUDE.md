# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Housing Need

This is an [Observable Framework](https://observablehq.com/framework/) project, used to visualise and explore the amount of housing needed in Ireland in the coming years.

## Build and Development Commands

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `npm install`        | Install or reinstall dependencies        |
| `npm run dev`        | Start local preview server (port 3000)   |
| `npm run build`      | Build static site, generating `./dist`   |
| `npm run deploy`     | Deploy app to Observable                 |
| `npm run clean`      | Clear the local data loader cache        |

## Project Structure

- **`src/`** - Source root with Markdown pages (file-based routing)
- **`src/index.md`** - Home page
- **`src/data/`** - Data loaders and static data files
- **`src/components/`** - Shared JavaScript modules
- **`observablehq.config.js`** - App configuration (sidebar nav, title, etc.)
