const fs=require('fs'); const p='src/components/WelcomeScreen.tsx'; let c=fs.readFileSync(p,'utf8'); c=c.replace(/\?\?\?\?\?/g,''); fs.writeFileSync(p,c,'utf8'); console.log('done');
