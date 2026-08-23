# Contributing to Green University Events

Guidelines for our team when working on this project.

## 1. Set up your Git identity (do this first, once per machine)

GitHub credits commits by the **name/email in your local Git config**, not by who's logged into the GitHub website. Before committing anything, confirm your identity is set correctly for this repo:

```bash
git config user.name
git config user.email
```

If either one shows a teammate's name/email instead of your own, fix it (run these from inside the project folder, not `--global`, so it only affects this repo):

```bash
git config user.name "your-github-username"
git config user.email "the-email-verified-on-your-github-account"
```

You can check your verified email(s) at `github.com/settings/emails` while logged into your own account.

## 2. Where things live

```
event management code/
├── backend/src/
│   ├── controllers/   # Business logic — one file per resource (events, auth, etc.)
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Maps HTTP verb + path → controller function
│   └── middleware/      # auth guard, validation, cookie parsing, error handling
└── frontend/src/
    ├── pages/           # One component per route (Events, EventDetail, Login, ...)
    ├── components/       # Reusable pieces shared across pages
    ├── context/          # AuthContext (global auth state)
    └── services/api.js   # All HTTP calls go through this Axios instance
```

**Route ordering matters in Express.** Specific paths (`/my-events`) must be declared *before* generic param routes (`/:id`), or Express will match the generic route first and error out.

## 3. Commit messages

Write the whole message on one line inside the quotes:

```bash
git commit -m "Add feedback and rating feature to event detail page"
```

If you want multiple bullet points, use `-m` more than once — **don't** paste multi-line text after the command, since each line will get run as its own (broken) terminal command:

```bash
git commit -m "Integration testing and docs" -m "- Added API docs" -m "- Fixed remove() bugs"
```

Run one Git command per line. Don't chain `cd`, `git add`, `git commit`, and `git push` together on a single pasted line — Windows `cmd` won't run them as a sequence.

## 4. Before you push

```bash
git status          # review exactly what's staged before committing
git add <files>      # stage specific files/folders rather than a blind `git add .` when unsure
git commit -m "..."
git push
```

If `git push` fails with a network error, just retry it — it's often transient.

## 5. Workflow for adding a feature

1. Pull the latest changes: `git pull`
2. Make your changes
3. Test locally — both `backend/` (`npm run dev`) and `frontend/` (`npm start`) running together
4. `git add`, `git commit`, `git push`
5. Update `README.md` or `backend/docs/API.md` if you added new endpoints or setup steps

## 6. Environment variables

Never commit your real `.env` file. Use `backend/.env.example` as the template — copy it to `.env` locally and fill in your own values.
