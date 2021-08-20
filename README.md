# A simple text editor 
[![Netlify Status](https://api.netlify.com/api/v1/badges/8f6995a1-0411-479e-8fbd-a79a2f989655/deploy-status)](https://app.netlify.com/sites/determined-bose-483d83/deploys)


A text editor that utilizes a basic browser API (the history API) to manage state. [See a demo running live](https://determined-bose-483d83.netlify.app/).

## How it works
There is one main module in this library which makes a lot of magic happen. The module handles string compression and decompression, its output is something you may notice after you type into the text field, a `base64` encoded string making up the URL fragment (the fragment is everything after the `#` in a url).  

## Development
- `git clone https://github.com/jordanhailey/itty-bitty-svelte-site`
- `npm i` (or `pnpm i`)
- `npm start`
