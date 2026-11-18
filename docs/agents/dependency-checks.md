# Dependency checks

## Do not use `npx expo install --check`

This command checks whether installed package **versions** satisfy the constraints in `package.json`. It does **not** verify that packages are physically present in `node_modules`. It will report "Dependencies are up to date" even when packages are missing entirely.

## Correct diagnostic

To verify a package is installed, check the directory directly:

```sh
ls node_modules/<pkg>
```

To verify all dependencies listed in `package.json` are present:

```sh
for pkg in $(node -e "const p=require('./package.json'); console.log(Object.keys({...p.dependencies,...p.devDependencies}).join('\n'))"); do
  [ -d "node_modules/$pkg" ] || echo "MISSING: $pkg"
done
```

## If packages are missing

Run:

```sh
npm install
```

Then re-run your command.
