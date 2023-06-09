import apisauce from 'apisauce'
import { RelationView } from './pages/Admin'

// ? REST API functions to communicate with your database backend
// ? Machine IP - replace with your server's IP address; run `ifconfig` and take the first inet IP address (should be below ens32)
const machineIP = "172.25.77.203"
const machinePort = "2222"
const api = apisauce.create({
    baseURL: `http://${machineIP}:${machinePort}`,
})

// ? A POST query to create your relation
export async function createRelation(relationData: any) {
    // ? Simply uses the API instance created by apisauce library to send the relationData object to the backend
    // ? Refer to the code to see the structure of the relationData object
    let res = await api.post("/table-create", relationData)
    // ? Methods to update you about the creation status of your relation
    if (res.ok) {
        alert("Created relation named " + relationData.name)
    } else {
        alert("Failed to create relation named " + relationData.name)
        console.log(res.data)
    }
}

// ? A GET method to obtain your relation from the backend
export async function getRelation(relationName: string) { // wrapper function around API call to retrieve data from DB. Takes name of relation as parameter and makes a HTTP GET request to the /table endpoint of API sever 
    let res = await api.get("/table", { "name": relationName })// with the name of the relation as query parameter
    if (res.ok) {
        return res.data as Promise<RelationView>
    } else {
        let data: RelationView = {
            columns: [],
            rows: [],
        }
        return data
    }

}

export async function insertEntry(entry: any) { // sends a POST request to server end point at "/table-insert", alert status 
    let res = await api.post("/table-insert", entry)
    if (res.ok) {
        console.log("Inserted successfully!")
        return true
    }
    alert("Failed to insert the given entry!")
    return false
}

export async function getEntry(entry: any) { // sends a POST request to server end point at "/table-retrieve", alert status 
    let res = await api.post("/table-retrieve", entry)
    console.log(res)
    if (res.ok) {
        //to test
        console.log(res.data)
        console.log("Retrieved successfully!")
        if (res.data) {
            return res.data
        }
    }
    alert("Failed to retrieve the given entry!")
    return false
}

export async function searchEntry(entry: any) { // sends a POST request to server end point at "/table-search", alert status 
    let res = await api.post("/table-search", entry)
    console.log(res)
    if (res.ok) {
        //to test
        console.log(res.data)
        console.log("Retrieved successfully!")
        if (res.data) {
            return res.data
        }
    }
    alert("Failed to retrieve the given entry!")
    return false
}

export async function updateEntry(entry: any) { // sends a POST request to server end point at "/table-update", alert status 
    let res = await api.post("/table-update", entry)
    if (res.ok) {
        console.log("Inserted successfully!")
        return true
    }
    alert("Failed to update the given entry!")
    return false
}

export async function deleteEntry(deletionData: any) { // sends a POST request to server end point at "/entry-delete", alert status 
    let res = await api.post("/entry-delete", deletionData)
    if (res.ok) {
        console.log("Deleted successfully!")
        return true
    }
    alert("Failed to delete the given entry!")
    return false
}

export async function deleteTable(tableName: any) {// sends a POST request to server end point at "/delete-table", alert status 
    let res = await api.post("/delete-table", {name: tableName})
    if (res.ok) {
        console.log("Deleted successfully!")
        return true
    }
    alert("Failed to delete the given table!")
    return false
    
}

export async function filterTable(filterValue: any) { // sends a POST request to server end point at "/table-filter", alert status 
    let res = await api.post("/table-filter", filterValue)
    console.log(res)
    if (res.ok) {
        console.log("Filtered successfully!")
        if (res.data) {
            return res.data
        }
    }
    alert("Failed to filter the given entry!")
    return false
}