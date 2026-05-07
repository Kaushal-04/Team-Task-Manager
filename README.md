# Team Task Manager

A full-stack web application designed for efficient team collaboration and project management. Users can create and join projects, assign tasks, and track their team's progress through an intuitive, dynamic interface.

## Features

- **User Authentication**: Secure signup and login functionality using JWT and HTTP-only cookies.
- **Project Management**: Create new projects (becoming an Admin automatically) and invite other users.
- **Task Management**: Create tasks, set priorities (Low, Medium, High), assign them to team members, and define due dates.
- **Interactive Kanban Board**: Visualize and update task statuses (To Do, In Progress, Done) seamlessly.
- **Analytics Dashboard**: Get a high-level overview of project statistics, including total tasks, completed tasks, and overdue items.
- **Role-Based Access Control**: 
  - **Admins**: Can add members, create tasks, assign tasks, and delete projects/tasks.
  - **Members**: Can view project details and update the status of tasks assigned to them.
- **Premium UI/UX**: Built with custom Vanilla CSS featuring modern glassmorphism design, smooth animations, and responsive layouts.

## Tech Stack

- **Frontend**: [Next.js (App Router)](https://nextjs.org/) & React
- **Backend**: Next.js API Routes (Serverless)
- **Database**: PostgreSQL (via [Railway](https://railway.app/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: Custom JWT implementation using `jose` and `bcryptjs`
- **Styling**: Vanilla CSS Modules
- **Deployment**: [Railway](https://railway.app/)

## Prerequisites

Before running this application, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [npm](https://www.npmjs.com/) or yarn

## Getting Started

Follow these steps to run the application locally:

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Team-Task-Manager.git
cd Team-Task-Manager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup the Database

By default, the project is configured to use **PostgreSQL**. You will need a PostgreSQL database URL. 

Create a `.env` file in the root of the project and add your database connection string and a secret key for JWT:

```env
# Create a .env file and add these variables
DATABASE_URL="postgresql://postgres:password@host:port/railway"
JWT_SECRET="your-super-secret-key-change-in-production"
```

If you wish to test locally with **SQLite** instead:
1. Open `prisma/schema.prisma`
2. Change the provider from `"postgresql"` to `"sqlite"`.
3. Change the url to `url = "file:./dev.db"`

Then, push the database schema:

```bash
npx prisma db push
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment on Railway

The easiest way to deploy this application is using **Railway**, which perfectly supports Next.js applications and PostgreSQL databases out-of-the-box.

1. Push this code to a GitHub repository.
2. Log in to [Railway](https://railway.app/) and click **New Project**.
3. Select **Deploy from GitHub repo** and choose your repository.
4. Once the app service is created, click **New** -> **Database** -> **Add PostgreSQL**.
5. After the database provisions, click on the **PostgreSQL** service, go to the **Connect** tab, and copy the `DATABASE_URL`.
6. Go back to your Next.js app service in Railway, click on the **Variables** tab, and add:
   - `DATABASE_URL`: (Paste the URL you copied)
   - `JWT_SECRET`: (Enter a secure, random string)
7. Railway will automatically inject the variables, run the `postinstall` script (`prisma generate`), and build your Next.js application.
8. Go to the **Settings** tab of your app service, and under **Public Networking**, click **Generate Domain** to make your app publicly accessible.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
