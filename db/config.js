require('dotenv').config();

module.exports = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    // const host = process.env.DB_HOST || 'localhost';              
    // const port = process.env.DB_PORT || '27017';       
    // const dbName = process.env.DB_NAME || 'app';
    // const params = process.env.DB_PARAMS || 'authSource=admin';   
    host: process.env.DB_HOST || 'schedules.nxuidm2.mongodb.net', // Host configurable
    options: process.env.DB_OPTIONS || 'retryWrites=true&w=majority&appName=Schedules',
    
    getUrl: function() {
        if (process.env.MONGODB_URI || process.env.DB_CONNECTION_STRING) {
            const uri = process.env.MONGODB_URI || process.env.DB_CONNECTION_STRING;
            console.log('Using direct connection string from environment');
            return uri;
        }
        
        // Construir la URL desde componentes individuales
        const url = `mongodb+srv://${this.user}:${this.password}@${this.host}/${this.dbName}?${this.options}`;
        console.log('Connection host:', this.host);
        console.log('Connection database:', this.dbName);
        return url;
    }
}