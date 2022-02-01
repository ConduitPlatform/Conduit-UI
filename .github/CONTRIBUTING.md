# Conduit-UI Contributing Guide

Welcome! We are really excited that you are interested in contributing to Conduit. Before submitting your contribution, please make sure to take a moment and read through the following guidelines:

- [Code of Conduct](https://github.com/ConduitPlatform/Conduit-UI/blob/master/.github/CODE_OF_CONDUCT.md)
- [Issue Reporting Guidelines](#issue-reporting-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)

## Issue Reporting Guidelines

- When you are creating a bug report, please include as many details as possible. 

- Before creating issue reports, perform a cursory search to see if the problem has already been reported. If it has and the issue is still open, add a comment to the existing issue instead of opening a new one.

- If you find a Closed issue that seems like it is the same thing that you're experiencing, open a new issue and include a link to the original issue in the body of your new one.

- Open a new issue using the [Issue Template](https://github.com/ConduitPlatform/Conduit-UI/blob/master/.github/ISSUE_TEMPLATE.md)

## Pull Request Guidelines

- Checkout a topic branch from `master`, and merge back.

- It's OK to have multiple small commits as you work on the PR - GitHub will automatically squash it before merging.

- If adding a new feature:
    - Add accompanying test case.
    - Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first and have it approved before working on it.

- If fixing bug:
    - If you are resolving a reported issue, add `(fix #xxx)` (#xxx is the issue id) in your PR title for a better release log, e.g. `update entities encoding/decoding (fix #389)`.
    - Provide a detailed description of the bug in the PR and the steps to reproduce it.

- **DO NOT** change `.gitignore`.

- Open a new pull request using the [Pull Request Template](https://github.com/ConduitPlatform/Conduit-UI/blob/master/.github/PULL_REQUEST_TEMPLATE.md)

## Development Setup

You will need [Node.js](http://nodejs.org) and [yarn](https://yarnpkg.com/en/docs/install).

After cloning the repo, run:

``` bash
yarn install
yarn dev
```

### Committing Changes

Commit messages should follow the [commit message convention](https://github.com/ConduitPlatform/Conduit-UI/blob/master/.github/COMMIT_CONVENTION.md) so that changelogs can be automatically generated.

### Commonly used scripts

``` bash
# watch and auto re-build the application
$ yarn dev

# build all dist files, including npm packages
$ yarn build

# recursively remove everything within the directory you choose
$ yarn clean
```

There are some other scripts available in the `scripts` section of the `package.json` file.

## Project Structure

- **`src`**:
    - `src/assets`: contains images and svgs used
    - `src/components`: contains most of the logic for the components, structured by subfolders where needed
    - `src/hooks`: contains a couple of much used custom react hooks
    - `src/http`: contains code related to the http requests, structured with folders of each module
    - `src/models`: contains everything TypeScript related that is used in more than one place
    - `src/pages`: contains all the routes of the app based on the NextJS convention
    - `src/redux`: contains Redux slices and asyncThunks needed for each module
    - `src/theme`: contains theming of the application based on Material UI v4
    - `src/utils`: contains everything that could not fit elsewhere such as helper function etc

- **`typings`**:
    
## Credits

Thank you to all the people who have already contributed to Conduit!

<a href="https://github.com/conduitplatform/conduit-ui/graphs/contributors"><img src="https://contrib.rocks/image?repo=conduitplatform/conduit-ui" /></a>
