# Ski Training Tracker ⛷️

## Background
Alpine ski racing training tracker, currently designed for the Whistler Mountain Ski Club U16 program. Role-based access control allows coaches, athletes, and parents to have personal logins. Athletes and parents have access to their athlete-specific dashboard with details on training sessions they attended whereas coaches are able to view every athlete on their team, and create new athletes and sessions. Sessions include details on date, location, training discipline, number of runs (and turns) by type (freeski, drill, education, course, race), snow conditions, visibility conditions, and terrain type. 

Graphs and filters allow for the user to analyze details of their season more closely. Coaches can use this information to adapt their training programs to best suit their team. 

Checkout the video walkthrough in the Projects section of my website to see the training tracker in action: [jaydenmetcalfe.com](jaydenmetcalfe.com)

Behind the scenes, a machine learning pipeline has been developed. XGBoost and neural network classifiers are used to analyze features from athletes' results and the junior level and use them to predict success at the senior level by classifying them into 7-tiers based on predicted peak world rankings per discipline. As of now, I have implemented class weighting, stratified train/test splits, feature standardization, model evaluation, probability prediction, and automated saving of models and evaluation outputs for the two models for SL, GS, and SG prediction.

*Note: these predictions are not meant to be 100% determinant of an athlete's success at the FIS level. It is only meant to help identify trends and patterns to aid in long-term athlete development. There will always be exceptions or athletes that stray from the regular path.*

## Data
Training tracker data is based on raw data gathered by WMSC U16 coaches for our athletes during the 2025-2026 season.

In the background, the dataset that is used for the machine learning pipeline is based on results and athlete data scraped from alpinepoints.ca and athlete data/World Rankings scraped from the FIS website. Over 10,000 athlete profiles and 190,000+ rows of junior level results were compiled. 

## How to run it
*Note: ML pipeline is not currently displayable via frontend. The connection exists behind the scenes but I have not yet incorporated it into the viewable dashboards.*

Note to self: set up concurrently in root 

frontend: `npm run dev`

backend: `nodemon server.js` for development and `node server.js` for production

python-service: 
`source .venv/bin/activate` to establish virtual environment

Then: 
`uvicorn main:app --reload --port 8000`

Access frontend locally via localhost:5173 on your browser

For now, the following IP address takes you to the login page. However, a personalized link is required to create an account. [52.53.239.90](http://52.53.239.90/)

for Docker:
`docker compose up --build`

to stop:
`docker compose down`

## Future plans
* Change the dashboard display, particularly for coaches, so multiple teams (within one club and amongst other clubs) can access and use it for their own specific teams without having access to every other team that uses the application.
* I plan on incorporating the ML classification and prediction models results into the frontend dashboards so coaches can play around with it. 
* If/when more training data is accumulated, it would be fun to add these variables into the mix and see how they affect future success of those specific athletes as they progress through U16 and FIS.
