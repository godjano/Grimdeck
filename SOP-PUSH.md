# SOP: Push Grimdeck to GitHub Pages

## Prerequisites
- Working directory: /workspace/warhammer-web
- GitHub token with repo access

## Steps

### 1. Verify build passes
```bash
cd /workspace/warhammer-web
npx tsc -b
npx vite build
```
Both must succeed with no errors.

### 2. Commit changes
```bash
git add -A
git status --short  # Review what's changed
git commit -m "Description of changes"
```

### 3. Push to GitHub
```bash
git remote set-url origin https://godjano:TOKEN@github.com/godjano/Grimdeck.git
git push origin main --force
git remote set-url origin https://github.com/godjano/Grimdeck.git  # Remove token
```

### 4. Verify deployment
- Check build: https://github.com/godjano/Grimdeck/actions
- Check site: https://godjano.github.io/Grimdeck/
- Ensure Pages source is set to "GitHub Actions" in repo Settings → Pages

### Quick one-liner (for agent use)
```
cd /workspace/warhammer-web && npx tsc -b && npx vite build && git add -A && git commit -m "MSG" && git remote set-url origin https://godjano:TOKEN@github.com/godjano/Grimdeck.git && git push origin main --force && git remote set-url origin https://github.com/godjano/Grimdeck.git
```
