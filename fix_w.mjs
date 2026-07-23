import fs from 'fs'; const p='src/components/WelcomeScreen.tsx'; let c=fs.readFileSync(p,'utf8'); c=c.replace(/[?]{5}/g,''); fs.writeFileSync(p,c,'utf8'); console.log('done');
