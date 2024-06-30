# BitBadges Quickstart Repo

Welcome to the BitBadges Quickstart Repo!

This site gets you started with developing on top of BitBadges. The code for this site was forked from the official BitBadges Frontend repository and pruned. Feel free to use that repository as a reference or copy code from it. There may be a lot of useful components or patterns in there, not all of which are used in this quickstart.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). It is a starting point, not a production-ready site. You will need to implement your own logic for many parts of the site.

The frontend uses AntDesign and TailwindCSS. The backend uses Next.js API routes and a simple cookie-based session system.

<!-- public/images/bitbadges-quickstart.png -->
<img src="https://github.com/bitbadges/bitbadges-quickstart/blob/main/public/images/bitbadges-quickstart.png" alt="BitBadges Quickstart" width="100%"/>

## Branches

The main branch is the default branch, but there are also other branches that you may find useful. We hope to support multiple use cases and provide a variety of starting points for different projects via the different branches. For example, there may be a branch with a subscription starter kit already implemented.

## Getting Started

First, you will need to configure your .env file. An example is provided at .env.example.

Second, run the development server:

```bash
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages. This is your "backend" whereas the rest of the code is your "frontend". You may have a backend but not a frontend, or vice versa. You can pick and choose what to keep from this codebase.

The documentation for BitBadges can be found [here](https://docs.bitbadges.io/) and for Blockin [here](https://blockin.gitbook.io/blockin/).
The comments and READMEs are to help guide you through the codebase, but you should refer to the official documentation for the most accurate and up-to-date information.

## Pruning

This site is a starting point for multiple aspects of BitBadges development. Most likely, you will not need all of the features in this repo.
Even for a single feature like authentication, there may be multiple implementations in this repository. You can remove the parts you don't need and add your own logic. Below, we go through the different parts of the site and what you may need to prune / customize.

## Help and Support

Feel free to reach out to the BitBadges team for help and support. You can reach us on Discord, Telegram, or email. We are happy to help you with your project and answer any questions you may have.

## Tracking Observations

It would also be great if you could track your experiences with the repo and provide feedback. What was easy to understand? What was difficult? What was missing? What would you like to see in the future? This will help us improve the quickstart repo and make it more useful for other developers in the future.

# BitBadges SDK

You have access to the BitBadges SDK via the "bitbadgesjs-sdk" package. This includes loads of useful functions for interacting with BitBadges.

# BitBadges API

You have access to the BitBadges API (assuming you have a valid .env set). See [here for more documentation](https://docs.bitbadges.io/for-developers/bitbadges-api/api). This is accessed via the BitBadgesApi variable such as

```ts
import { BitBadgesApi } from 'bitbadgesjs-sdk';

await BitBadgesApi.getStatus();
```

We have also implemented a simple Redux store for fetching collections and accounts. This automatically handles pruning requests to not fetch stuff
you already have. Also, it appends the fetched data to the store, so it handles paginations in a seamless way. You can use the following functions to fetch collections and accounts:

```ts
//React useSelector
const collection = useCollection(collectionId);

fetchCollections([collectionId]);
fetchCollectionsWithOptions([{ collectionId, ...options }]);
```

```ts
//React useSelector
const account = useAccount(addressOrUsername);

fetchAccounts([addressOrUsername]);
fetchAccountsWithOptions([{ address, username, ...options }]);
```

# Transactions

Most dApps will not need to broadcast transactions directly in-site. You can simply redirect to the official BitBadges frontend for most cases.
Or, you can use the [broadcast helper tool](https://docs.bitbadges.io/for-developers/create-and-broadcast-txs/sign-+-broadcast-bitbadges.io) to broadcast transactions. This allows you to specify the transaction contents, open it in a popup, and let BitBadges handle the signing, simulating, and broadcasting for you. However, if you do need to broadcast transactions in-site, you can also do so directly in-site.

# Frontend Components

Out of the box, we really only provide an Address UI component, but if you need more, you can reference the official BitBadges Frontend repository. It has a lot of useful components and patterns that you can copy from. Some might be a bit messy and over-engineered for the frontend, but you can use them as a reference or copy them directly.

# Self-Hosting

In the pages/api/selfhost folder, you will see examples of how to host metadata and balances yourself. You will just need to host it in a manner that is queryable from the BitBadges API, accounting for CORS and such. The on-chain URL will be the URL of your self-hosted values.

# Distribution / Balance Assgnment

You may also use this starter as a way to distribute codes / passwords or update the allocated off-chain balances based on some criteria or interaction. For example, you may want to give a claim code only to users who subscribe. Or, you assign and update your off-chain balances if the user has completed a certain task.
