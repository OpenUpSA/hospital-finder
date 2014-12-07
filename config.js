var config = {
	google_email: "me@gmail.com",
	google_pass: "MyPassword",
	email_from: "Code4SA <jason@code4sa.org>",
	email_host: "smtp.gmail.com",
	email_user: "me@gmail.com",
	email_pass: "MyPassword",
	email_to: "blah@blah.com, blahblah@blah.com",
	email_subject: 'New Submission from Hospitals App',

  db_url: process.env.DATABASE_URL || 'mysql://c4sa_hospitals:RZaAS24MHes2rB9c@localhost/hospitals',
};

module.exports = config;
