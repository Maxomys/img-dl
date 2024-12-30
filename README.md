# Image Downloader

This project is a Node.js-based API for downloading and managing images. It provides functionalities to queue image downloads, track their status, and retrieve information about downloaded images. The API uses Express for routing, PostgreSQL for data storage, and BullMQ for background job processing with Redis.

## Prerequisites

- Node.js >= 20
- npm or yarn
- PostgreSQL database
- Redis server

## Quick start

- **Clone this repository**

- **Run the project with docker compose:**

  ```bash
  docker compose up
  ```

  **Or**

- **Install dependencies:**

  ```bash
  npm install
  ```

- **Establish environment settings for the local server:**

  ```bash
  cp .env.example .env
  ```

  And set the variables

- **Database Setup:**

  - Ensure your PostgreSQL database is running and accessible.
  - Initialize the database schema using Drizzle ORM:
    ```bash
    npm run db:generate
    npm run db:migrate
    ```

- **Start the API server:**

  ```bash
  npm run dev # For development with hot-reloading
  # or
  npm run build
  node dist/index.js # For production
  ```

- **Access the API:**
  The API will be accessible at `http://localhost:3000` (or the port specified in your `.env` file).

## Api documentation

Swagger documentation is available at ``/api-docs`` endpoint.

## Running tests

The project includes end-to-end (E2E) tests using Jest and Supertest.

**To run the E2E tests:**

- Ensure you have a separate test database configured.

- Create a test.env file in the root directory and set the DB_URL to your test database connection string.

- Run the tests:

  ```bash
  npm run test:e2e
  ```
