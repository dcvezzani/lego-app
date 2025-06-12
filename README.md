My Lego App is a web application that allows me to view my sets and add bricks to a set that I own. It should use Bulma to style the site. It should use Vue.js for its JavaScript framework and include support for FontAwesome (for Bulma). It should use the api available on rebrickable.com. The API documentation can be found here: https://github.com/dcvezzani/lego-search/pull/new/windows-path-compatibility

My Lego App should use Google for OAuth authentication and should be used to establish a user account for the user, maintained in a sqlite database.

Here are the pages that should be available:

Homepage

- user does not need to be signed in to access this
- an icon in the top right should be available to indicate whether the user is signed in or not
- when the user is signed out, they should have the option to sign in and be returned to the page where they were originally trying to navigate to
- when the user is signed in, they should have the option to sign out and be returned to the home page
- when the user is signed in and a record with their email address does not exist in the sqlite database, prompt them to create a record that includes a screen name and their rebrickable api key (both fields should be optional) and then continue on with the sign in process by redirecting to their originally selected url along with a session cookie that expires in 4 hours
- in all cases, there should be a search box that allows the user to search the official lego catalog for a brick using the rebrickable.com api

Lego Personal Set Management Page

- user must be signed in to access this page; redirect to Google OAuth if the user is not yet signed in
- the page should consist of two rows
  - row 1: should consist of a search input field; use will search for a brick here; search results should be displayed below the input field as entries that wrap using flex across three columns
    - each search result should include the following:
      - id, name, color, url to rebrickable details page, thumbprint image
  - row 2: should consist of three columns
    - column 1: a widget that can be used as a text field with auto-complete or a select form input listing all the user's registered sets; registered sets can be determined using rebrickable.com's api
    - column 2: an image, a form and three buttons
      - image: populated after the user clicks on one of the search result entries; clicking on the image should navigate the user to the detail page for the selected brick
      - form: fields include id, name, color, count
      - three buttons: add, move, delete
        - add: should add "count" number of bricks to the selected set on the left (in row 2, column 1)
        - move: should move "count" number of bricks from the selected set on the left (in row 2, column 1) to the selected set on the right (in row 2, column 3)
        - delete: should remove "count" number of bricks from the selected set on the left (in row 2, column 1)
    - column 3: a widget that can be used as a text field with auto-complete or a select form input listing all the user's registered sets; registered sets can be determined using rebrickable.com's api
- any action initiated by the user should result in a toast displayed to report whether the action was successful or not; there should be a checkbox option that turns this feature off if it is selected
- if the user has not yet entered their api key, they should be prompted to do so; the api key should be saved with their user record in the sqlite database

## For Developers

### Prerequisites

- Node.js
- Git Bash (for Windows users)

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   & 'C:\Program Files\Git\bin\bash.exe' --login -i start-dev.sh
   ```
   This will start the development server at http://localhost:5173/

dcv
