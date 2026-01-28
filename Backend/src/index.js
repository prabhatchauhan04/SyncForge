import server from './server.js';
import { PORT } from './config/constants.js';

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
