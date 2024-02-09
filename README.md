# BitBadges Quickstart Repo

Welcome to the BitBadges Quickstart Repo! 

This site gets you started with developing on top of BitBadges. To run it locally, visit the GitHub source code. To see a live version, visit the live quickstart site. Some tools can function without running the site locally, whereas others may require running the site locally. The code for this site was forked from the official BitBadges Frontend repository and pruned. Feel free to use that repository as a reference or copy code from it. There may be a lot of useful components or patterns in there, not all of which are used in this quickstart.

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

# Authentication

This site implements multiple ways to authenticate with BitBadges. You will not need all of them. 
Reference the Blockin documentation for more information [here](https://blockin.gitbook.io/blockin/developer-docs/getting-started).

The site by default uses cookies for sessions and short redeem windows for signatures to prevent replay attacks. You can customize this to your needs and gate whatever you want behind authentication (i.e. checking session cookies or whatever you choose).

You will need to handle sessions in your preferred manner, prevent common attacks, and implement any custom logic for your specific requirements. If you do not need instant authentication, consider outsourcing the frontend by letting BitBadges handle the signature and cache it for you to fetch later via the API (see [here](https://blockin.gitbook.io/blockin/developer-docs/getting-started/sign-in-with-bitbadges)).

All verification logic (i.e. checking signatures, ownership, etc) is handled by the BitBadges API by default. If you want to handle this yourself, reference the Blockin documentation for more information [here](https://blockin.gitbook.io/blockin/developer-docs).  The boilerplate code for this is in the pages/api/selfverify folder, but you can further customize this to your needs. This might be useful for offline verification, or if you want to add additional logic to the verification process.

## Web3 Authentication

Since you are building a Web3 dApp, you will probably need to handle digital Web3 authentication one way or the other. You can either outsource this to a Sign in with BitBadges (SIWBB) popup or implement your own Web3 authentication in-site. See [here](https://blockin.gitbook.io/blockin/developer-docs/getting-started/user-signatures#which-one-to-use) for deciding which option to pick. These are typically not used together for optimal user experience.

These should be decoupled in the codebase. Anything labeled "in-site" is for in-site Web3 authentication, and anything labeled "SIWBB" is for Sign in with BitBadges.

For Ethereum connection (if you choose to use), the default code uses WalletConnect. To use this, you will need to provide your WalletConnect info in the .env file.

## Web2 Authentication

We also support a basic implementation of a [hybrid dApp](https://blockin.gitbook.io/blockin/developer-docs/getting-started/user-signatures#which-one-to-use) that uses Web2 authentication. This allows you to use standard (username, password) authentication and map everything behind the scenes to a Web3 address. Wherever signatures are required, you manage the mnemonic / private key and handle the signature for the user. This app by default maps usernames to addresses, but you could also do the reverse (i.e. addresses to custom in-app usernames).

Whenever a new user creates an account, a new mnemonic is generated for them and stored in the database. You simply use the mnemonic to sign for the user. 

Note that in order to broadcast transactions, addresses need to be registered (i.e. sent any amount of $BADGE) on the BitBadges blockchain. This is also a pre-requisite because gas fees need to be paid. This is not handled natively.

The Web2 authentication currently is a very simple implementation. You will need to implement your own logic for handling user sessions, password resets, etc. There are also many add-ons you can implement, like 2FA, email verification, Sign In with XYZ Company, etc. You also have design decisions to make, like being able to migrate to a self-hosted solution? Allow payment in $BADGE for premium features?

## Manual Authentication

Lastly, there is manual authentication. This may be used for more specific use cases, like in-person events. Maybe you want to authenticate users based on a QR code or a physical badge. For example, you could set a QR code scanner to keyboard mode and have it type in the QR code value (i.e. signature) for you to verify. NFC is also a possibility. The QR codes being signatures is how the BitBadges QR code system works on the official frontend for authentication codes.

# BitBadges SDK 

You have access to the BitBadges SDK via the "bitbadgesjs-sdk" package. This includes loads of useful functions for interacting with BitBadges.

# BitBadges API

You have access to the BitBadges API (assuming you have a valid .env set). See [here for more documentation](https://docs.bitbadges.io/for-developers/bitbadges-api/api). This is accessed via the BitBadgesApi variable such as   
```ts
import { BitBadgesApi } from 'bitbadgesjs-sdk'

await BitBadgesApi.getStatus()
```

We have also implemented a simple Redux store for fetching collections and accounts. This automatically handles pruning requests to not fetch stuff
you already have. Also, it appends the fetched data to the store, so it handles paginations in a seamless way. You can use the following functions to fetch collections and accounts:
```ts
//React useSelector
const collection = useCollection(collectionId)

fetchCollections([collectionId])
fetchCollectionsWithOptions([ { collectionId, ...options } ])
```

```ts
//React useSelector
const account = useAccount(addressOrUsername)

fetchAccounts([addressOrUsername])
fetchAccountsWithOptions([ { address, username, ...options } ])
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