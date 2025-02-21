## Dự án Sức Mạnh 2000 - HST Nuôi em

### How to run project locally

1. Client

- Go to `client`
- Install package dependency `npm install`
- Start frontend client `npm run client`

2. Server

- Go to `server`
- Install package dependency `npm install`
- Start backend server `npm run server`
- Initialize backend local docker redis (one time only) `npm run server:local-docker-redis`
- Sync index Firestore and Redis (optional) `node scripts/indexFirestoreDocsToRedis`

3. Admin

- Go to `admin`
- Install package dependency `npm install`
- Start admin `npm run admin`

Note:

- Ask for env files
- Create PR for any new feat / bug fixes / maintenance
