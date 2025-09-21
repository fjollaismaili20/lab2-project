// Importing module
import pkg from 'pg'
const { Pool } = pkg

const postgresdb = new Pool({
    host: "localhost",
    user: "root",
    password: "fjola123",
    database: "job",
    port: 5432
})

export const postgresConnection = () => {
    postgresdb.connect((err, client, release) => {
        if (err) {
            console.log("Error in the connection")
            console.log(err)
        }
        else {
            console.log(`Connected to PostgreSQL database`)
            release()
        }
    })
};
