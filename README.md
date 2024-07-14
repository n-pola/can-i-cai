# Can I CAI?

[![Deployment](https://github.com/n-pola/can-i-cai/actions/workflows/deployment.yaml/badge.svg)](https://github.com/n-pola/can-i-cai/actions/workflows/deployment.yaml)
[![CI-Backend](https://github.com/n-pola/can-i-cai/actions/workflows/backendIntegration.yaml/badge.svg)](https://github.com/n-pola/can-i-cai/actions/workflows/backendIntegration.yaml)
[![CI-Frontend](https://github.com/n-pola/can-i-cai/actions/workflows/frontendIntegration.yaml/badge.svg)](https://github.com/n-pola/can-i-cai/actions/workflows/frontendIntegration.yaml)
[![CI-Parser](https://github.com/n-pola/can-i-cai/actions/workflows/parserIntegration.yaml/badge.svg)](https://github.com/n-pola/can-i-cai/actions/workflows/parserIntegration.yaml)
[![CI-Validator](https://github.com/n-pola/can-i-cai/actions/workflows/validatorIntegration.yaml/badge.svg)](https://github.com/n-pola/can-i-cai/actions/workflows/validatorIntegration.yaml)
[![CI-Shared](https://github.com/n-pola/can-i-cai/actions/workflows/sharedIntegration.yaml/badge.svg)](https://github.com/n-pola/can-i-cai/actions/workflows/sharedIntegration.yaml)
[![Verify Markdown Data](https://github.com/n-pola/can-i-cai/actions/workflows/checkMarkdownData.yaml/badge.svg)](https://github.com/n-pola/can-i-cai/actions/workflows/checkMarkdownData.yaml)

"Can I CAI?" is a web app that allows users to check if their publication workflows of images on the web are compatible with standards promoted by the Content Authenticity Initiative (CAI). The goal is to allow media professionals and other creatives who want to create a more trustworthy and authentic web to easily check if their tools and services are compatible with the desired standards and thus promote and engage the adaptation of these.

The webapp is developed as part of Nils Polareks bachelor thesis at the Cologne University of Applied Sciences.

See the [wiki](https://github.com/n-pola/can-i-cai/wiki) for further information about the development process and choices.

## Content
1. [Contributions](#contributions)
    1. [General](#general)
    2. [Contributing data](#contributing-data)
        1. [Categories schema](#categories-schema)
        2. [Components schema](#components-schema)
        3. [Explanation of types](#explanation-of-types)
2. [Local development](#local-development)
3. [API](#api)

## Contributions
As the C2PA and CAI are open source projects, this webapp will also follow this philosophy. Feel free to contribute to this project, especially in the area of data for the app.

### General
If you want to contribute to the project, please fork the repository and create a pull request with your changes. See [Local development](#local-development) for more information on how to setup the project locally. Be sure to have eslint and prettier installed in your editor to ensure a consistent code style. You can use the provided npm scripts to lint and format the code, see `package.json` of respective service for more information.

Once you create a pull requests, the CI will run the tests and linting checks on changed parts (also the data). If all checks pass, the PR can be reviewed and merged. Otherwise, please fix the issues and push the changes to the PR.

### Contributing data
To keep everything open, transparent and editable by the OSS community, the data for the app is also stored in this repository and used to populated the db via the parser. In a local environment you will need to run/restart the parser after changing data to see the changes in the app. You can do that via docker desktop or with the following command in the root directory of the repository:
```bash
docker compose restart parser
```

Categories and components is stored in the `data` directory and defined in frontmatter format. These are yaml like structures prepended to standard markdown content/files.

The data directory is structured as follows:
```
data
├── category-name
│   ├── index.md (Holds further information about the category)
│   ├── Manufacturer Name (Directory, e.g. Adobe, directory name will be used in db as it is)
│   │   ├── component.md (Defines a component in category x for manufacturer y)
│   │   ├── component-2.md
│   ├── Manufacturer Name 2
...
├── category-name-2
...
```

If you want to contribute or update data, please create or change the respective markdown files in the data directory. See [general contribution infos above](#general) for more information on how to contribute.

> [!CAUTION]
> If you create or update a component and claim it is compatible with the c2pa specifications you must either provide the source in the data or set `tested` to `true` and provide your test results in the PR description.

> [!IMPORTANT]
> If you create new data, you need to run the Parser locally at least once so that i can populate the newly created files with a persistent ID.

Changed data will be validated against predefined schemas to assure their correctness on pull requests. If your PR gets merged the data will be populated into the live db on the next deployment.

See the following sections for the schema of categories and components.

#### Categories schema
```yaml
---
en: string (Category name in english)
de: string (Category name in german)
icon: string (Material symbol name, see https://fonts.google.com/icons)
_id: string (automatically populated by the parser, do not change manually)
---
```

#### Components schema
```yaml
---
name: string
type:
  - output
  - input-output
(Array of strings, defines the components abilities. Can be output, input-output, input)
compatible: boolean
minimalRequiredVersion: string (Optional, set the version after which the component is compatible with CAI)
source: string (Optional, link to the source where the compatibility is stated)
tested: boolean (Optional, set to true if you tested the compatibility with the c2pa specifications)
_id: string (automatically populated by the parser, do not change manually)
---
Additional information defined in standard markdown. Will be displayed in the components details
```
#### Explanation of types
The types are used to define what a component can do with an image.
* `output`: The component can create a new image from scratch (e.g. Camera or Editing software that can create new images or illustrations)
* `input-output`: The component needs an input image and manipulates or changes this to create a new output (e.g. Editing software that can edit images or a CLI tool that compresses images)
* `input`: The component only takes an image as input and does not create a new usable output, but may distribute the image (e.g. Social media platforms, websites, etc. that display images)


## Local development
1. You need to have docker setup on your machine
2. Clone the repository
3. Change into the repository directory
4. Change into the shared directory and install its dependencies
    ```bash
    cd shared && npm install
    ```
5. Start all the services via docker compose in the root directory
    ```bash
    docker compose up -d
    ```
6. Wait for the parser to finish importing all data into the db. You can check the logs of the parser service via
    ```bash
    docker compose logs -f parser
    ```
7. Open the frontend in your browser at [http://localhost:8080](http://localhost:8080)

> [!TIP]
> If you change any of the types or schemas in the `shared` directory, run `npm install` in any of the consuming projects once to build the package and propagate the changes to all parts using it.

## API
Use the `insomnia-request-collection.json` in the root of this repository to explore the API of the backend.
