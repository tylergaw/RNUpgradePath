# Upgrading or Creating a New React Native Project with 0.57.x
#### Posted 2018-11-16

Between RN 0.54.x and 0.57.x lots of things changed that make the upgrade and even new project creation path a bit rough. I first tried to upgrade a project from 0.54 and hit a wall. Then I tried to create a new project with `react-native init` and hit a few of the same issues. These are steps I took along the path to get a working React Native project using 0.57.5.

*NOTE: The final source code may not exactly match the examples below. I added more has I worked, you should be able to go back through the commits to get to any of the states though.*

## Steps:
1. **Update to latest `react-native-cli` globally**

```
# react-native -v
react-native-cli: 2.0.1
react-native: 0.57.5
```

2. **Create a new project**

```
react-native init UpgradeTest
```

3. **Add some "stuff"**

In my original project I hit a wall trying to run tests with Jest. So that's a focus for this upgrade project. I wanted to get similar components in place and be able to test them with `yarn test` or `npm test`. I created one `Button` component that lives in a `components` directory.

![Screenshot of the components directory](https://cl.ly/fdef3bc92e57/Screen%20Shot%202018-11-16%20at%209.08.06%20AM.png)

`Button.js` is a basic `TouchableOpacity` element. With stuff in place, time to test.

```
yarn test
```

## Issue 1:

```bash
# yarn test
yarn run v1.12.3
$ jest
 FAIL  components/__tests__/Button.test.js
  ● Test suite failed to run

    Couldn't find preset "module:metro-react-native-babel-preset" relative to directory "/Users/tyler/Desktop/UpgradeTest"

      at node_modules/babel-core/lib/transformation/file/options/option-manager.js:293:19
          at Array.map (<anonymous>)
      at OptionManager.resolvePresets (node_modules/babel-core/lib/transformation/file/options/option-manager.js:275:20)
      at OptionManager.mergePresets (node_modules/babel-core/lib/transformation/file/options/option-manager.js:264:10)
      at OptionManager.mergeOptions (node_modules/babel-core/lib/transformation/file/options/option-manager.js:249:14)
      at OptionManager.init (node_modules/babel-core/lib/transformation/file/options/option-manager.js:368:12)
      at File.initOptions (node_modules/babel-core/lib/transformation/file/index.js:212:65)
      at new File (node_modules/babel-core/lib/transformation/file/index.js:135:24)
      at Pipeline.transform (node_modules/babel-core/lib/transformation/pipeline.js:46:16)

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        0.466s
Ran all test suites.
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
```

This seems to be a common problem with both upgrading existing projects and creating new projects.

In [this Github issue comment](https://github.com/facebook/react-native/issues/21241#issuecomment-431464191) it's suggested we rename `.babelrc` to `babel.config.js`. That worked for me.

With that I changed, again try to run tests

```
yarn test
```

## Issue 2:

```bash
# yarn test
yarn run v1.12.3
$ jest
 FAIL  components/__tests__/Button.test.js
  ● Test suite failed to run

    /Users/tyler/Desktop/UpgradeTest/node_modules/react-native/jest/mockComponent.js: Unexpected token (20:23)

      Jest encountered an unexpected token
      This usually means that you are trying to import a file which Jest cannot parse, e.g. it's not plain JavaScript.
      By default, if Jest sees a Babel config, it will use that to transform your files, ignoring "node_modules".
      Here's what you can do:
       • To have some of your "node_modules" files transformed, you can specify a custom "transformIgnorePatterns" in your config.
       • If you need a custom transformation specify a "transform" option in your config.
       • If you simply want to mock your non-JS modules (e.g. binary assets) you can stub them out with the "moduleNameMapper" config option.
      You'll find more details and examples of these config options in the docs:
      https://jestjs.io/docs/en/configuration.html
      Details:
        18 |
        19 |   const Component = class extends SuperClass {
      > 20 |     static displayName = 'Component';
           |                        ^
        21 |
        22 |     render() {
        23 |       const name =

Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        0.429s
Ran all test suites.
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
```

The error message here is not so helpful, but issue seems to be static class properties. This took a good bit of searching to find and it seems like it's pretty widespread. [This comment](https://github.com/facebook/react-native/issues/19859#issuecomment-407748189) has a fix that worked for me.

On that advice, I added the `transform` key to my `jest` config in `package.json`:

```json
...
"jest": {
  "preset": "react-native",
  "transform": {
    "^.+\\.js$": "<rootDir>/node_modules/react-native/jest/preprocessor.js"
  }
}
...
```

Once again `yarn test`. This time all tests pass as expected.

```bash
# yarn test
yarn run v1.12.3
$ jest
 PASS  components/__tests__/Button.test.js
  Button
    ✓ renders correctly with props (279ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   1 passed, 1 total
Time:        0.95s, estimated 5s
Ran all test suites.
✨  Done in 1.65s.
```

## Issue 3:

**Note**: This didn't happen in this project, but did in another RN project that I was upgrading from RN 0.54.x.

When attempting to start the Metro bundler with `yarn start`, I got:

```bash
Error: Unable to resolve module `regenerator-runtime/runtime` from `/Users/gcred/workspace/streetcred/app/node_modules/react-native/Libraries/Core/InitializeCore.js`: Module `regenerator-runtime/runtime` does not exist in the Haste module map

This might be related to https://github.com/facebook/react-native/issues/4968

To resolve try the following:
  1. Clear watchman watches: `watchman watch-del-all`.
  2. Delete the `node_modules` folder: `rm -rf node_modules && npm install`.
  3. Reset Metro Bundler cache: `rm -rf /tmp/metro-bundler-cache-*` or `npm start -- --reset-cache`.
  4. Remove haste cache: `rm -rf /tmp/haste-map-react-native-packager-*`.
```

I followed those four steps, but the problem persisted. I took a look in my local `node_modules` folder and noticed there was not a `regenerator-runtime` directory. When running `npm ls` I also noticed a few other warnings about missing peer dependencies. With that, I guessed that my `yarn.lock` and/or `package-lock.json` files were stale, so I:

1. Deleted `yarn.lock` and `package-lock.json`
2. `rm -rf node_modules`
3. `yarn && npm i`

That reinstalled the dependencies and regenerated the lock files. After that, `yarn start` works as normal.

---------------------------------------

## Jest / Class fat arrow methods:

This isn't directly related to the RN upgrade, but I hit it in this process so including it here just in case.

I often make use of autobinding class methods in React components. I'm not sure what the correct name is and I can't find a durn spec for it. But, using a fat arrow when defining a class method to make sure `this` refers to the parent class instead of whomever invoked the method.

In this example, I've updated the `App` component to include one of these methods.

```javascript
class App extends PureComponent {
  doWork = () => {
    console.log("This doesn't do anything. Writing this function to make sure fat arrow class methods work. Narrator: They don't work");
  }

  render() {
    return <Home />;
  }
}
```

The app still runs in the simulator but, tests now fail:

```bash
# yarn test
yarn run v1.12.3
$ jest
 FAIL  __tests__/App.test.js
  ● Console

    console.error node_modules/react-test-renderer/cjs/react-test-renderer.development.js:8060
      The above error occurred in the <App> component:
          in App (at App.test.js:7)

      Consider adding an error boundary to your tree to customize error handling behavior.
      Visit https://fb.me/react-error-boundaries to learn more about error boundaries.

  ● App › renders correctly

    TypeError: Cannot read property 'default' of undefined

      2 | import { Home } from "Screens";
      3 |
    > 4 | class App extends PureComponent {
        |                                                                          ^
      5 |   doWork = () => {
      6 |     console.log("This doesn't do anything. Writing this function to make sure fat arrow class methods work.")
      7 |   }

      at new App (App.js:4:383)
      at constructClassInstance (node_modules/react-test-renderer/cjs/react-test-renderer.development.js:4810:18)
      at updateClassComponent (node_modules/react-test-renderer/cjs/react-test-renderer.development.js:6579:5)
      at beginWork (node_modules/react-test-renderer/cjs/react-test-renderer.development.js:7413:16)
      at performUnitOfWork (node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10138:12)
      at workLoop (node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10170:24)
      at renderRoot (node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10256:7)
      at performWorkOnRoot (node_modules/react-test-renderer/cjs/react-test-renderer.development.js:11121:7)
      at performWork (node_modules/react-test-renderer/cjs/react-test-renderer.development.js:11033:7)
      at performSyncWork (node_modules/react-test-renderer/cjs/react-test-renderer.development.js:11007:3)

 PASS  components/Screens/__tests__/Home.test.js
 PASS  components/Patterns/__tests__/Button.test.js

Test Suites: 1 failed, 2 passed, 3 total
Tests:       1 failed, 2 passed, 3 total
Snapshots:   2 passed, 2 total
Time:        1.216s
Ran all test suites.
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
```

**NOTE: I have not found a way around this yet and it's killing me, halp**
