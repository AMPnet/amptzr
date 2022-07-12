# Amptzr

[![ci](https://github.com/AMPnet/amptzr/actions/workflows/ci.yaml/badge.svg)](https://github.com/AMPnet/amptzr/actions/workflows/ci.yaml)

The platform for tokenizing real–world assets – powered by blockchain.

## Development

### IDE setup

Install [Prettier](https://prettier.io/) and enable it in your IDE.

### Setup project

```bash
# Clone repo & contracts submodule
git clone git@github.com:AMPnet/amptzr.git && \
  git submodule init && \
  git submodule update

# install dependencies
npm install

# run development server
npm start
```

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

```bash
# generate a component
ng g c my-component

# generate a service
ng g s shared/my-service

# generate a feature state (Akita)
ng g @datorama/akita:af my-feature/my-feature --plain --entityService=default
```

## Build

```bash
# generate production build. produced artifacts
# will be located in `/dist` directory
npm run build
```

### Try production build

```bash
# serve and open in a browser
npm run serve-build
```

## Lint & Test

```bash
# run linter (eslint)
npm run lint

# run linter and fix issues
npm run lint:fix

# run tests
npm run test
```

There are precommit rules set by [husky](https://github.com/typicode/husky). For more information, check the [docs](https://typicode.github.io/husky/#/).

## Learning Resources

- RxJS (Reactive Programming)
  - [Official Documentation](https://rxjs.dev)
  - [Collect, Combine and Cache RxJS Streams for User-Friendly Results by Deborah Kurata](https://www.youtube.com/watch?v=HE-xh_RBIno)
    - excellent talk why RxJS is useful and how to use it
  - [Handling Observables with NgIf and the Async Pipe](https://ultimatecourses.com/blog/angular-ngif-async-pipe)
- Akita (State Management)

  - [Official Documentation](https://datorama.github.io/akita/docs/angular/architecture/) – architecture

- TailwindCSS (Utility-First CSS framework)

  - [Official Documentation](https://tailwindcss.com/)
    - the best place to get used to class names (use search! it acts as a cheatsheet).
  - [Adam Wathan (creator) YouTube videos](https://www.youtube.com/c/AdamWathan/videos)
    - excellent place to start picking up patterns on how to think while using the framework,
    - the videos about redesigning popular websites are great to see the creative process from the creator's point of view.
  - [Tailwind Labs YouTube channel](https://www.youtube.com/channel/UCOe-8z68tgw9ioqVvYM4ddQ)
    - community channel; great for tips & tricks.

- [Ethers.js](https://ethers.io/) (library for interacting with Ethereum Blockchain)
  - [Official Documentation](https://docs.ethers.io/v5/single-page/)
- [Polygon Network](https://polygon.technology/) (previously Matic)
  - [Developer documentation](https://docs.matic.network/docs/develop/getting-started)
