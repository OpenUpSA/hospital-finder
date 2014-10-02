# Hospital Finder

This project uses data supplied by City Press of South African hospitals that have been surveyed by the Department of Health in 2011/2012.

The project is split into two parts. The first part, under CityPress - Hospitals, deals with the scraping of the PDFs from the DoH.

The second part, under express, is a Node.js Express app that searches for the nearest hospitals, and then returns the closest with their ratings.

The app uses MySql. You'll have to have MySql running to use it. The default database is "hospitals", with the table "hospitals". You'll find the Sql in the express/data folder. The host is localhost, the user is c4sa_hospitals and the password is RZaAS24MHes2rB9c. You can change all of these in /express/routes/find.js.

## Installation

To install the express app, do the following:

```bash
cd express
npm install
npm start
```

The app should now be running on port http://localhost:3000.

If you want to run it on a server or somewhere apart from localhost, you'll need to update the Google Geocoding browser API key at /express/public/javascript/hospitals.js (right at the top). You can get one if you don't have it at https://code.google.com/apis/console/b/0/?noredirect. The system will still work without this - it's just used for reverse geocoding lookup when you use the location finder, and it fills in the address field. For other geo-lookups, we use the Code4SA Address to Ward Converter. 