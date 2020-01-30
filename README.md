# patanaauto

website for Patana Auto enterprise

## Starting the app

**BackEnd**
node app in root app

**FrontEnd**
- locally: `ng build --watch`

## how are the annonces updated

There is a scheduler package that runs inside app.js. When the app is running:

**First Scheduler**
 every week, on Sunday at 1:01am, the app connects to the ftp, retrieves the xml file. checks if there is one already there. If so, it makes a differenciation and from the difference, retrieves the needed data and needed photos.

 **Second Scheduler**
 every month, on the 1st of that month, at 1:01am, another scheduler runs and will clean up the photos. That means that all the photos which are on the server but are not linked to any item inside the current up to date file, will be deleted.

