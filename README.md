# BitBadges Quickstart Repo

Welcome to the BitBadges Quickstart Repo!

This quickstarter helps you get started with common multi-chain development flows. This is a [Next.js](https://nextjs.org/) project. It should be treated as a starting point and customized to fit your needs.

The frontend uses antd and TailwindCSS. The backend uses Next.js API routes and a simple HTTP cookie-based session system.

<img src="https://github.com/bitbadges/bitbadges-quickstart/blob/main/public/images/bitbadges-quickstart.png" alt="BitBadges Quickstart" width="100%"/>

## What does this repo include out of the box?

- A simple frontend with antd and TailwindCSS
- Frontend components for multi-chain users (search users by name or address, selects, etc)
- Multi-chain authentication of users via Sign In with BitBadges
- Access to the BitBadges ecosystem through its API and SDK
- Requesting signatures from wallets

## Alternative Branches

The main branch is the default branch, but there are also other branches that you may find useful. We hope to support multiple use cases and provide a variety of starting points for different projects via the different branches. For example, there may be a branch with a subscription starter kit already implemented.

# Getting Started

1. Clone the repo
2. Install the dependencies with `npm i`
3. Configure the .env file (see .env.example)
4. Run the development server with `npm run dev` and open [http://localhost:3000](http://localhost:3000) with your browser
5. Start building your project! 🚀

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages. This is your "backend" whereas the rest of the code is your "frontend". You may have a backend but not a frontend, or vice versa. You can pick and choose what to keep from this codebase.

## TODOs

You can find TODOs scattered throughout the codebase. These are meant to be a starting point for you to build your project. You can remove them as you handle them.

## Dev Mode

In development mode, it is aimed to be a more visual and interactive experience for what is happening behind the scenes. This is useful for testing and debugging.

## In-Site Wallets

Depending on your use case, you may or may not need to communicate with wallets. If you do not, simply turn off wallet mode, prune the unnecessary code, and enjoy a more streamlined experience.

# What do you have access to?

## Sign In with BitBadges

Sign In with BitBadges is a simple and secure way to authenticate users. It is an OAuth2 flow that outsources all the heavy work to BitBadges. This is a great way to authenticate users without needing to interact with wallets on your end.

[SIWBB Documentation](https://docs.bitbadges.io/for-developers/authenticating-with-bitbadges/overview)

## BitBadges SDK / API

You have access to the BitBadges SDK via the "bitbadgesjs-sdk" package. This includes loads of useful functions for interacting with BitBadges.

This alsop includes access to the BitBadges API (assuming you have a valid .env set). See [here for more documentation](https://docs.bitbadges.io/for-developers/bitbadges-api/api).

This is accessed via the BitBadgesApi variable such as

```ts
import { BitBadgesApi } from 'bitbadgesjs-sdk';

await BitBadgesApi.getCollections(...);
```

[SDK Documentation](https://docs.bitbadges.io/for-developers/bitbadges-sdk/overview)

[API Documentation](https://docs.bitbadges.io/for-developers/bitbadges-api/api)

## Wallet Interactions

Your app may need to request signatures (messages, transactions, etc) from wallets. We have provided global contexts for all supported chains.
Simply have the user connect their wallet and then use the context to request signatures via a unified interface.

```ts
const chainContext = useChainContext();
await chainContext.signMessage('Hello, World!');
```

We refer you to individual wallet / chain documentation for more information on wallet interactions.

# Help, Support, and Feedback

Feel free to reach out to the BitBadges team for help and support. We are happy to help you with your project and answer any questions you may have.
Please provide feedback on this repo and let us know how we can improve it for your project!
