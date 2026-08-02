# Frontend AI Coding Rules for Visual Finance (React + Tailwind v4)

## 1. Styling and Design Standards
**Problem**: Inconsistent UI patterns.
**Rule**:
- Use Outfit or Montserrat as the default modern font family.
- Adhere strictly to the black-and-white sleek theme (g-slate-900, 	ext-slate-900) for primary buttons and interactions to ensure a premium fintech aesthetic.

## 2. API Fetching
**Problem**: Silent token expiration causing auth errors.
**Rule**: Always use the custom piFetch utility from src/utils/api.ts instead of the native etch API. piFetch automatically intercepts 401 Unauthorized responses and attempts to refresh the access token silently in the background before retrying the request.
