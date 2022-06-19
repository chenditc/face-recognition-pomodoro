# Face Recognition Pomodoro

## What is this?

This is a **Pomodoro clock**.

Unlike other Pomodoro Clock, it can automatically help you start **a focus session** when the camera detected your face. When the camera 
no longer detect your face, it starts **a rest session**.

### What if I left my camera but don't want to stop the Pomodoro session?

If the time of stepping away is less than **Max Allowed Missing Time**
in the settings, the Pomodoro session will continue the session when you are back.

### Will this slow down my computer or phone?

No, this is very light weighted and takes only milliseconds on mobile GPU to detect your face. 
Thanks to the BlazeFace model from Google.

## Available Scripts

In the project directory, you can run:

### `npm install`

Install the necessary components dependency.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.
