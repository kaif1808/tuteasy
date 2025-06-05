# Tutor Search and Matching API

This document describes the backend implementation of the tutor search and matching system for TutEasy.

## Overview

The search system allows authenticated users (students, parents) to find tutors based on various criteria including subjects, qualification levels, keywords, and more. The system includes advanced filtering, sorting, and pagination capabilities.

## API Endpoints

### Base URL
All search endpoints are prefixed with `/api/search`

### Authentication
All endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

## Endpoints

### 1. Search Tutors

**GET** `/api/search/tutors`

Search for tutors with various filters and sorting options.

#### Query Parameters

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `subjects` | array[string] | No | Array of subject names to filter by | - |
| `levels` | array[string] | No | Array of qualification levels | - |
| `keywords` | string | No | Keywords to search in bio and qualifications | - |
| `sortBy` | string | No | Sort criteria: `relevance`, `experience`, `hourlyRateMin`, `hourlyRateMax`, `rating` | `relevance` |
| `sortOrder` | string | No | Sort order: `asc`, `desc` | `desc` |
| `page` | number | No | Page number (1-based) | `1` |
| `limit` | number | No | Results per page (max 50) | `10` |

#### Qualification Levels

The `levels` parameter accepts the following values:
- `EARLY_YEARS`, `PRIMARY`, `KS1`, `KS2`, `KS3`
- `GCSE`, `IGCSE`, `A_LEVEL`, `AS_LEVEL`
- `BTEC_LEVEL_1`, `BTEC_LEVEL_2`, `BTEC_LEVEL_3`
- `IB_PYP`, `IB_MYP`, `IB_DP_SL`, `IB_DP_HL`, `IB_CP`
- `UNDERGRADUATE`, `POSTGRADUATE`, `ADULT_EDUCATION`, `OTHER`

#### Example Requests

```bash
# Basic search
GET /api/search/tutors

# Search for mathematics tutors
GET /api/search/tutors?subjects[]=Mathematics

# Search for GCSE and A-Level tutors
GET /api/search/tutors?levels[]=GCSE&levels[]=A_LEVEL

# Search with keywords
GET /api/search/tutors?keywords=experienced%20cambridge

# Combined search with pagination
GET /api/search/tutors?subjects[]=Physics&levels[]=A_LEVEL&page=2&limit=20

# Sort by experience
GET /api/search/tutors?sortBy=experience&sortOrder=desc
```

#### Response

```json
{
  "success": true,
  "data": {
    "tutors": [
      {
        "id": "tutor_123",
        "userId": "user_456",
        "user": {
          "id": "user_456",
          "email": "tutor@example.com",
          "role": "TUTOR"
        },
        "bio": "Experienced mathematics tutor with 5 years teaching experience",
        "hourlyRateMin": 25.00,
        "hourlyRateMax": 40.00,
        "profileImageUrl": "https://example.com/profile.jpg",
        "verificationStatus": "VERIFIED",
        "isActive": true,
        "rating": 4.5,
        "totalStudents": 20,
        "languageProficiencies": ["English", "Spanish"],
        "subjects": [
          {
            "id": "subject_789",
            "subjectName": "Mathematics",
            "qualificationLevel": "A_LEVEL",
            "proficiencyLevel": "EXPERT",
            "yearsExperience": 5,
            "hourlyRate": 35.00,
            "examBoards": ["AQA", "Edexcel"],
            "ibSubjectGroup": null,
            "ibLanguage": null
          }
        ],
        "qualifications": [
          {
            "id": "qual_101",
            "qualificationType": "BACHELORS_DEGREE",
            "qualificationName": "Mathematics BSc",
            "institution": "University of Cambridge",
            "verificationStatus": "VERIFIED"
          }
        ],
        "experienceYears": 5,
        "relevanceScore": 95.5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "filters": {
      "subjects": ["Mathematics"],
      "levels": ["A_LEVEL"],
      "keywords": "experienced",
      "sortBy": "relevance",
      "sortOrder": "desc"
    }
  }
}
```

### 2. Get Search Statistics

**GET** `/api/search/tutors/statistics`

Get aggregated statistics for search results (useful for analytics and UI display).

#### Query Parameters
Same as the search endpoint - statistics are calculated based on the current filter criteria.

#### Example Request

```bash
GET /api/search/tutors/statistics?subjects[]=Mathematics&levels[]=GCSE
```

#### Response

```json
{
  "success": true,
  "data": {
    "totalResults": 15,
    "averageExperience": 4.2,
    "averageRating": 4.3,
    "priceRange": {
      "min": 20.00,
      "max": 80.00
    },
    "popularSubjects": [
      {
        "subject": "Mathematics",
        "count": 15
      },
      {
        "subject": "Physics",
        "count": 8
      }
    ]
  }
}
```

### 3. Get Filter Options

**GET** `/api/search/filters`

Get available subjects and qualification levels for filter dropdowns.

#### Example Request

```bash
GET /api/search/filters
```

#### Response

```json
{
  "success": true,
  "data": {
    "subjects": [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "English Literature",
      "History"
    ],
    "qualificationLevels": [
      "GCSE",
      "A_LEVEL",
      "IB_DP_HL",
      "IB_DP_SL"
    ]
  }
}
```

### 4. Get Tutor Details

**GET** `/api/search/tutors/:id`

Get detailed information for a specific tutor (simplified implementation).

#### Example Request

```bash
GET /api/search/tutors/tutor_123
```

#### Response

```json
{
  "success": true,
  "data": {
    // Same structure as individual tutor object in search results
  }
}
```

## Search Features

### 1. Subject Filtering
- Filter by one or more subjects using the `subjects[]` parameter
- Uses OR logic (tutors teaching ANY of the specified subjects)
- Case-insensitive matching

### 2. Qualification Level Filtering
- Filter by educational levels using the `levels[]` parameter
- Supports UK curriculum (GCSE, A-Level) and IB programmes
- Uses OR logic (tutors qualified for ANY of the specified levels)

### 3. Keyword Search
- Search across tutor bios, qualification names, and institutions
- Uses case-insensitive matching
- Supports multiple keywords (space-separated)
- Calculates relevance scores for ranking

### 4. Relevance Scoring Algorithm

The relevance score is calculated using the following factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| Bio matches | 10 points | Keywords found in tutor bio |
| Subject matches | 8 points | Keywords found in subject names |
| Exact subject match | +5 bonus | Complete subject name match |
| Qualification matches | 5 points | Keywords found in qualification names |
| Institution matches | 3 points | Keywords found in institution names |
| Experience bonus | 0.5 per year | Up to 5 points for experience |
| Rating bonus | 2x rating | Up to 10 points for 5-star rating |

### 5. Sorting Options

- **Relevance**: Default sort using calculated relevance scores
- **Experience**: Sort by maximum years of experience across subjects
- **Hourly Rate**: Sort by minimum or maximum hourly rates
- **Rating**: Sort by tutor rating (when rating system is implemented)

### 6. Security and Filtering

Only tutors meeting these criteria are included in search results:
- `isActive: true` - Active tutors only
- `verificationStatus: "VERIFIED"` - Verified tutors only
- `user.isEmailVerified: true` - Email-verified users only

## Error Responses

### Validation Errors (400)

```json
{
  "success": false,
  "error": "Invalid search parameters",
  "details": [
    {
      "field": "page",
      "message": "Expected number, received string"
    }
  ]
}
```

### Server Errors (500)

```json
{
  "success": false,
  "error": "Failed to search tutors"
}
```

## Implementation Notes

### Database Performance
- Efficient Prisma queries with proper indexing
- Pagination to handle large result sets
- Optimized joins for related data

### Future Enhancements
The current implementation provides a solid foundation for:
- Rating and review system integration
- Advanced filtering (location, availability)
- Machine learning-based recommendations
- Real-time search suggestions

### Rate Limiting
All search endpoints are subject to the global rate limiting:
- 100 requests per 15 minutes per IP
- Consider implementing search-specific rate limits for production

## Testing

The implementation includes comprehensive test coverage:
- Unit tests for SearchService logic
- Controller tests for HTTP handling
- Mock Prisma client for isolated testing
- Validation testing for all parameters

## Database Schema Requirements

The search system relies on the following database models:
- `User` - Base user information
- `Tutor` - Tutor profile data
- `TutorSubject` - Subject expertise and qualifications
- `TutorQualification` - Educational credentials

Ensure proper indexing on:
- `Tutor.isActive`
- `Tutor.verificationStatus`
- `User.isEmailVerified`
- `TutorSubject.subjectName`
- `TutorSubject.qualificationLevel` 