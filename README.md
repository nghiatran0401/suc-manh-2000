## Sucmanh2000 Project

### How to run project locally

1. Client

- Go to `client`
- Install package dependency `npm install`
- Start frontend `npm run client`

2. Server

- Go to `server`
- Install package dependency `npm install`
- Setup redis `docker-compose -f docker-compose.redis.yaml up -d`
- Start backend `npm run server`

3. Admin

- Go to `admin`
- Install package dependency `npm install`
- Start admin `npm run admin`

Note:

- Ask Nghia for env files + service account file
- Create PR with at least 1 approval before any deployments
