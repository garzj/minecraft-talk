import * as express from 'express';
import {
  buildDir,
  buildDirExists,
  indexFile,
  indexFileExists,
} from '../../config/paths';

export const webAppRouter = express.Router();

if (buildDirExists) {
  webAppRouter.use(express.static(buildDir));
} else if (process.env.NODE_ENV === 'production') {
  console.error(
    `Could not find the web app inside ${buildDir}. Please make sure to build it properly!`
  );
  process.exit(1)
}

webAppRouter.use((req, res) => {
  if (indexFileExists) {
    // Default to index.html
    res.sendFile(indexFile);
  } else {
    res.send(
      "The web application hasn't been built yet. Please contact the server admins!"
    );
  }
});
