# API Documentation Template

<!-- ==========================================================
     PROJECT-SPECIFIC: Fill this entirely when starting a new project
     ========================================================== -->

## Overview

- **Base URL:** [API_BASE_URL]
- **Auth Type:** [AUTH_TYPE — e.g., Bearer token, API key]
- **Rate Limits:** [FILL_PER_PROJECT]

## Authentication

[FILL_PER_PROJECT — Describe how to obtain and refresh tokens, where to store them, how they're sent with requests]

## Error Response Format

All endpoints return errors in this format:

```json
{
  "error": {
    "code": 400,
    "message": "Description of what went wrong"
  }
}
```

## Pagination

[FILL_PER_PROJECT — Describe pagination pattern: page/limit, cursor-based, etc.]

## Endpoints

### [ENDPOINT_NAME]

**`[METHOD] [PATH]`**

**Description:** [What this endpoint does]

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| | | | |

**Request Body:**

```json
{}
```

**Response 200:**

```json
{}
```

**Error Responses:** 401 Unauthorized, 400 Bad Request, 500 Internal Server Error

---

_Copy the endpoint block above for each endpoint in the project._

<!-- ==========================================================
     END OF PROJECT-SPECIFIC SECTION
     ========================================================== -->
