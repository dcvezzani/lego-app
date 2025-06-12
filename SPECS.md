# My Lego App - Technical Specifications

## Overview

My Lego App is a web application designed to help users manage their LEGO collection by viewing sets and managing bricks within those sets. The application integrates with the Rebrickable.com API for LEGO data and uses Google OAuth for authentication.

## Technical Stack

- **Frontend Framework**: Vue.js
- **CSS Framework**: Bulma
- **Icon Library**: FontAwesome
- **Database**: SQLite
- **Authentication**: Google OAuth
- **External API**: Rebrickable.com

## Authentication & User Management

### Google OAuth Integration

- Implements Google OAuth for user authentication
- Session cookie duration: 4 hours
- Redirects users back to their originally requested page after successful authentication

### User Data Storage

#### SQLite Database Schema

User table should include:

- Email address (from Google OAuth)
- Screen name (optional)
- Rebrickable API key (optional)
- Created at timestamp
- Updated at timestamp

## Page Specifications

### 1. Homepage

#### Access Requirements

- Public access (no authentication required)
- Authentication status indicator in top right corner

#### Features

1. **Authentication UI**

   - Sign-in button when user is not authenticated
   - Sign-out button when user is authenticated
   - Post-authentication redirect to original page
   - Post-sign-out redirect to homepage

2. **Search Functionality**

   - Search box for querying official LEGO catalog
   - Integration with Rebrickable.com API
   - Accessible to both authenticated and unauthenticated users

3. **New User Flow**
   - Check for existing user record upon first sign-in
   - If no record exists:
     - Prompt for screen name (optional)
     - Prompt for Rebrickable API key (optional)
     - Create user record
     - Redirect to original destination

### 2. Lego Personal Set Management Page

#### Access Requirements

- Authentication required
- Automatic redirect to Google OAuth if not authenticated
- Rebrickable API key prompt if not previously provided

#### Layout Structure

1. **Search Row (Row 1)**

   - Search input field
   - Results display:
     - Flex layout with 3 columns
     - Each result shows:
       - ID
       - Name
       - Color
       - Rebrickable details page URL
       - Thumbnail image

2. **Management Row (Row 2)**

   ##### Column 1: Source Set Selection

   - Auto-complete text field or select dropdown
   - Populated with user's registered sets via Rebrickable API

   ##### Column 2: Brick Management Interface

   - Dynamic image display (updates on search result selection)
   - Form fields:
     - ID
     - Name
     - Color
     - Count
   - Action buttons:
     1. Add: Adds specified quantity to source set
     2. Move: Transfers specified quantity between sets
     3. Delete: Removes specified quantity from source set

   ##### Column 3: Destination Set Selection

   - Auto-complete text field or select dropdown
   - Populated with user's registered sets via Rebrickable API

#### Feedback System

- Toast notifications for all user actions
- Success/failure status display
- Configurable notification toggle

### 3. User Profile Management Page

#### Access Requirements

- Authentication required
- Automatic redirect to Google OAuth if not authenticated

#### Features

1. **Profile Information**

   - Display current email address (read-only, from Google OAuth)
   - Edit screen name
   - Last login timestamp
   - Account creation date

2. **API Management**

   - Securely view/edit Rebrickable API key
   - Test API key validity
   - Clear API key option
   - API usage statistics (if available from Rebrickable)

3. **Account Management**
   - Account deletion option
     - Confirmation modal with warning about data loss
     - Require password re-entry for confirmation
     - Option to download account data before deletion
     - Cleanup of all associated data:
       - User profile
       - Personal set data
       - Custom configurations
       - Session data
   - Export account data option (JSON format)

#### Security Measures

- Require recent authentication for sensitive operations
- Rate limiting for API key testing
- Secure transmission of API key updates
- Audit logging for account changes

#### User Interface

- Clear warning messages for destructive actions
- Confirmation dialogs for sensitive operations
- Success/error notifications for all actions
- Responsive form layout using Bulma
- Password strength requirements for deletion confirmation

## API Integration

### Rebrickable.com API

- Used for:
  1. LEGO catalog searches
  2. Set registration verification
  3. Brick data retrieval
- API key storage in SQLite database
- Error handling for API failures

## User Experience Requirements

1. Responsive design using Bulma
2. Intuitive navigation
3. Clear feedback for all actions
4. Graceful error handling
5. Efficient brick management workflow

## Security Considerations

1. Secure storage of API keys
2. OAuth implementation best practices
3. Session management
4. Input validation
5. CSRF protection

## Performance Requirements

1. Quick search response times
2. Efficient set management operations
3. Optimized API calls
4. Responsive UI interactions

## Future Considerations

1. Offline mode support
2. Bulk operations
3. Export/import functionality
4. Advanced search filters
5. Set statistics and analytics
