# @prototype-studio/personas

AI agent persona library for Prototype Studio.

## Installation

```bash
npm install @prototype-studio/personas
```

## Usage

```typescript
import { personas, getPersona, getPersonasByTool } from '@prototype-studio/personas'

// Get all personas
console.log(personas)

// Get a specific persona
const cos = getPersona('chief-of-staff')

// Get personas for a specific tool
const claudePersonas = getPersonasByTool('claude-code')
```
