PROJECT OVERVIEW:

This project was designed for students who need to keep track of their assignments (such as me). Once they register and login, they can look at their assignments and completed assignments. Right off the bat, they obviously won't have any of either so they can go to the assignments page and add assignments by entering the assignment name, due date and description and submit it. Once submitted, it will appear on the assignment list. With a created assignment, they can mark it as "no longer due" which will delete the assignment or if they complete the assignment, they can mark it as completed. When they do this, the assignment will be transferred over the the completed assignments page. On the completed assignments page, the user will see a list of the completed assignments and when they were completed. Personally, I find looking at all the work I've done makes me feel proud of myself so I put this page in with that purpose in mind. The user can choose to delete the completed assignments if perhaps they want to clear up the page or it has just been awhile since they completed it and they don't really care anymore.

Note for Dor: I wasn't able to get react working the way it needed to be so I opted to use the ejs files for the front end instead, please don't deduct the full 28% please lol

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

INSTALLATION STEPS:

- go to powershell terminal
- cd backend
- npm install bcryptjs cors dotenv ejs express express-session jsonwebtoken mongodb mongoose passport passport-local
- nodemon server.js

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

API DOCUMENTATION:

- /
  + GET request that renders the home page and supplies it with the user currently logged in

- /register 
  + GET request renders registration page
  + POST takes the username and password that the user entered and creates an account for them and then redirects the user to the login page

- /login
  + GET request renders the login page
  + POST authenticates the login and if it succeeds the user is redirected to the home page, otherwise they stay on the login page

- /logout
  + POST request that will log the user out

- /work
  + GET request gets all the assignments in the database that belong to the logged in user and renders those assignments and the user on the work page
  + /work/add POST request takes the assignment name, due date and description and creates a new assignment that belongs to them and then redirects the user back to the work page where the new assignment will be rendered
  + /work/delete POST request will delete the assignment that the "no longer due" button was attached to and re-renders the page

- /complete
  + GET request gets all the completed assignments that belong to the logged in user and renders them on the completed work page
  + /complete/add POST request is attached to assignments on the assignments page with the "completed" button and will create a completed assignment document from the assignment marked as completed, delete the assignment from the work collection and then re-renders the 
    assignment page
  + /complete/delete POST request deletes the assignment that the "remove" button was attached to and re-renders the completed assignments page
