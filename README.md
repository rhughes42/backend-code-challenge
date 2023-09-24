# GAN Integrity Backend Code Challenge

> Author: [Ryan Hughes](https://www.linkedin.com/in/whoisryan/)  
> Date: 21 Sep 2023  
> Role: Senior Software Engineer

## Introduction

The script `index.js` uses a local API to perform various operations on a set of cities.

The script is written in Node.js and uses the `axios` library to make requests to the API. The script is written in a functional style and uses `async/await` to handle asynchronous operations.

## Dependencies

The auth pipeline uses the `dotenv` library to access a secret assumed to be set in the `.env` file. If not present, the auth script will use a default, hardcoded secret. You can create a `.env` file in the root directory of the project and set the secret there using:

```console
echo TOKEN=$(openssl rand -hex 32) > .env
```

## Running The Code

-   Change directory to the root of the project: `cd src`
-   Install dependencies: `npm install`
-   Run the script: `npm start`
