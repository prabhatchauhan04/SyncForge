import 'dotenv/config';
import express from 'express';
import routes from './http/routes';

const app = express();

const PORT = process.env.PORT || 3000;


app.use('/api/v1' , routes);



app.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`);
});