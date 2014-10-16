To deploy after an update (and push to Github):

```
ssh root@bigserver.code4sa.org
cd /var/www/hospital-finder.code4sa.org/express
git pull
npm install
supervisorctl restart hospital_finder
```
