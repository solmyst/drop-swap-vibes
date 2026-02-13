# Archive Folder

This folder contains historical documentation and SQL migration files that are not actively used but kept for reference.

## Structure

### `/sql-migrations`
Contains all SQL migration scripts and database setup files:
- Database setup scripts
- Feature additions (verification system, email notifications, etc.)
- Bug fixes and patches
- Admin setup scripts
- RLS policy updates

### `/documentation`
Contains historical documentation and guides:
- Deployment guides and status reports
- Feature implementation documentation
- Troubleshooting guides
- Fix summaries and changelogs
- Setup instructions for various features

## Important Notes

- These files are archived for reference only
- The actual database migrations are managed in `/supabase/migrations/`
- Active documentation should be kept in the root or relevant feature folders
- Do not delete this folder - it contains important historical context

## When to Reference

- When debugging issues related to past features
- When understanding how a feature was implemented
- When rolling back changes
- When setting up similar features in the future
