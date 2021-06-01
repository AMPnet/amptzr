# Amptzr

The platform for tokenizing real-world assets – powered by blockchain.

## Development

```
# install dependencies
npm install

# run development server
npm start
```

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

```
# generate a component
ng g c my-component

# generate a service
ng g s shared/my-service

# generate a feature state (Akita)
ng g @datorama/akita:af my-feature/my-feature --plain --entityService=default
```

## Build

```
# generate production build. produced artifacts
# will be located in `/dist` directory
NODE_ENV=prod ng build --configuration production
```

### Try production build

```
# serve and open in a browser
npx http-server ./dist/amptzr --cors -c-1 -g -b -o -P http://localhost:8080\?
```

## Lint/Test

```
# run linter (eslint)
npm run lint

# run tests
npm run test
```
