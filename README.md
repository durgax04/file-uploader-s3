# This is PDF uploading site in s3.

## Getting Started
- Clone the repo:
  ```bash
   git clone https://github.com/Wolf1610/pdf-uploader-s3.git
  ```
- Install dependencies:
  ```bash
   pnpm install
  ```
- Create .env file and edit it:
  ```bash
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    AUTH_SECRET="" 
    NEXTAUTH_URL="http://localhost:3000"
    AWS_BUCKET_NAME=""
    AWS_BUCKET_REGION=""
    AWS_ACCESS_KEY_ID=""
    AWS_SECRET_ACCESS_KEY="" 
    DATABASE_URL=""
  ```
- Migrate the DB:
  ```bash
   npx prisma migrate dev --name init
  ```
- Generate prisma client:
  ```bash
   npx prisma generate
  ```
- Run the dev server:
  ```bash
   pnpm dev
  ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
