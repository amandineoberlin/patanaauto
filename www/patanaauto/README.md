# Patanaauto

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.2.

## Development server

Run `ng build --serve` for a dev server. Navigate to `http://localhost:5001/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## logger: bunyan available levels

"fatal" (60): The service/app is going to stop or become unusable now. An operator should definitely look into this soon.
"error" (50): Fatal for a particular request, but the service/app continues servicing other requests. An operator should look at this soon.
"warn" (40): A note on something that should probably be looked at by an operator eventually.
"info" (30): Detail on regular operation.
"debug" (20): Anything else, i.e. too verbose to be included in "info" level.
"trace" (10): Logging from external libraries used by your app or very detailed application logging.

## starting the app / app environnement

environment is retrieved with process.env.NODE_ENV defined in ./environment.js.
When starting app in dev mode, use "node app", it will automatically run the app in dev mode. In production, run the app with "npm start", which will automatically run the app in production mode.
