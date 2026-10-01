# SelfTrainer Roadmap

This document tracks the product roadmap for the SelfTrainer learning app and serves as a reference for implementation milestones.

## Phase 1: Application Foundation & Authentication

Status: Complete

Goals:
- Scaffold the Next.js + TypeScript application
- Configure Prisma with SQLite for local development
- Set up NextAuth with credentials-based login and registration
- Protect authenticated routes and dashboard access
- Validate the app builds successfully

Completed work:
- Created the Next.js app shell
- Added authentication pages for login and registration
- Implemented Prisma schema for users, accounts, sessions, and verification tokens
- Added password hashing and credential validation
- Added middleware protection for authenticated routes
- Added TypeScript compatibility for NextAuth session typing
- Verified the project builds successfully

## Phase 2: Study Materials & Plans

Status: Complete

Goals:
- Let users save learning materials
- Let users create structured study plans
- Display saved content on the dashboard
- Keep user data isolated by authenticated user ID

Completed work:
- Added API routes for study materials
- Added API routes for study plans
- Added forms for creating materials and plans
- Added dashboard UI for listing entries by user
- Added route-level protection and session-based filtering

## Phase 3: Learning Workflow Enhancements

Status: Planned

Goals:
- Make the app more useful as a daily learning tracker
- Add structured study sessions and progress tracking
- Support recurring habits and engagement metrics
- Improve the dashboard experience with summaries and status views

Planned features:
- Study session tracking (start, end, duration, completion)
- Progress history by topic or material
- Daily/weekly streak tracking
- Completion states for materials and plans
- Better dashboard cards for activity summaries

## Phase 4: Personalization & Recommendations

Status: Planned

Goals:
- Better adapt the product to individual learning behavior
- Provide suggestions based on prior activity and goals

Planned features:
- Topic/category tagging for materials
- Suggested next study actions
- Priority sorting for incomplete tasks
- Goal-based plan generation and nudges

## Phase 5: UX & Polish

Status: Planned

Goals:
- Improve usability and engagement for real-world usage
- Make the dashboard feel like a complete study app

Planned features:
- Better visual design and responsive layouts
- Empty-state and onboarding flows
- Search and filtering for saved materials/plans
- User settings and account management views
- Notifications and reminders for study goals

## Phase 6: Production Readiness

Status: Planned

Goals:
- Prepare the app for deployment and real use
- Strengthen reliability and maintainability

Planned features:
- Environment-based configuration cleanup
- Deployment setup for a hosted platform
- Error monitoring and logging
- Automated validation and CI checks
- Database migration and backup strategy

## Immediate Next Steps

Priority order:
1. Add study session tracking with start/end timestamps and completion state
2. Add progress summaries to the dashboard
3. Introduce topic categories and better organization for materials
4. Add streak and consistency tracking
5. Improve the dashboard UX with cards, analytics, and empty states

## Notes

- Authentication and protected dashboard access are already in place.
- The app foundation is stable and build-verified.
- Keep all new features aligned to the existing Next.js App Router + Prisma + NextAuth architecture.
