import { useEffect, useState } from "react";
import { Credentials } from "../types/types";
import { useNavigate } from "react-router-dom";
import * as api from '../api'
import { airbnbdata } from "../data/airbnb";

const airbnbSchema = {
    name: "TEXT",
    host_id: "INTEGER",
    host_name: "TEXT",
    neighbourhood: "TEXT",
    room_type: "TEXT",
    price: "INTEGER",
    availability: "INTEGER",
}

export default function Login() {
    const [credentials, setCredentials] = useState<Credentials>({ username: '', password: '' });
    const [adminCode, setAdminCode] = useState<string>('');
    const navigate = useNavigate();

    const ADMIN_CODE = "ADMIN"

    //init: add users table and airbnb table if dont exist
    useEffect(() => {
        checkIfUsersTableExists();

        //uncomment dropTable() only if you want to re-enter the data in airbnb.ts
        // dropTable();

        insertAirbnbData();
    }, [])

    //check if users table exists. if not, cretae.
    const checkIfUsersTableExists = async () => {
        const res = await api.getRelation("users");
        if (res.columns.length === 0) {
            await api.createRelation({
                name: "users",
                body: {
                    username: "TEXT",
                    password: "TEXT",
                    role: "TEXT",
                }
            })
        }
    }

    const insertAirbnbData = async () => { //ensure relation exist and has data. inserts data into airbnb relation
        const res = await api.getRelation("airbnb");
        console.log(res)
        if (res.columns.length === 0) {
            await api.createRelation({
                name: "airbnb",
                body: airbnbSchema
            })
        }
        if (res.rows.length === 0) {
            await Promise.all(airbnbdata.map(async entry => {
                await api.insertEntry({
                    name: "airbnb",
                    body: entry,
                    valueTypes: { ...airbnbSchema, id: "INTEGER" }
                })
            }));
        }
    }

    const dropTable = async () => {
        await api.createRelation({
            name: "airbnb",
            body: airbnbSchema
        })
    }

    const onCreateUser = async () => { // Creates a user with a specified role (either "admin" or "user") and inserts the the data into a database using an API call.
        const user = createUserWithRole();
        if (user) {
            await api.insertEntry({
                name: "users",
                body: {
                    username: user.username,
                    password: user.password,
                    role: user.role
                },
                valueTypes: {
                    username: "TEXT",
                    password: "TEXT",
                    role: "TEXT",
                }
            })
            console.log('completed')
            clearData();
        }
    }

    const createUserWithRole = () => { // check if admin code is valid
        if (adminCode.length > 0 && adminCode !== ADMIN_CODE) {
            alert("Invalid admin code!")

        } else {
            if (adminCode.length > 0 && adminCode === ADMIN_CODE) { // if admin code valid, it would be a admin account
                alert("Admin signed up successfully")
                return { ...credentials, role: 'admin' }
            }
            else{
                alert("User signed up successfully") // else it would be a user account
            return { ...credentials, role: 'user' }
            }
        }
    }

    const clearData = () => { // resets state of credentials and admin code to empty strings 
        setCredentials({ username: '', password: '' })
        setAdminCode('')
    }

    const onLogin = async () => { // makes API call to retrieve user data from the DB 
        const user = await api.getEntry({
            name: "users",
            body: {
                username: credentials.username,
                password: credentials.password,

            },
            valueTypes: {
                username: "TEXT",
                password: "TEXT",
            }
        }) as any
        console.log(user);

        if (!user || user.length <= 0 || user[0].length != 3) { //check if user, password match 
           return
        }


        if (user && user.length > 0 && user[0].length === 3) { // check if the person performing log in is a admin or user before redirecting them to the correct page
            alert("Invalid username or password!");
            if (user[0][2] === 'admin')  navigate("/admin");
            else if (user[0][2] === 'user')  navigate("/users");
        }
    }

    return (
        <div className="column">
            <div className="row">
                <p>Username:&nbsp;</p>
                <input type="text" value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} />
            </div>
            <div className="row">
                <p>Password:&nbsp;</p>
                <input type="password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} />
            </div>
            <div className="row">
                <p>Admin code (if any):&nbsp;</p>
                <input type="text" value={adminCode} onChange={(event) => setAdminCode(event.target.value)} />
            </div>
            <div className="row">
                <button onClick={onCreateUser}>Sign Up</button>
                <button onClick={onLogin}>Log In</button>

            </div>
        </div>
    )
}