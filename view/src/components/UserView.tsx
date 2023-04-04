import { useState } from "react"
import { RelationView } from "../pages/Admin"
import TableView from "./TableView"
import * as api from '../api'

interface EditViewProps {
    // ? Takes RelationView from the parent to interactively modify
    relationView: RelationView;
    setSearchResults: (relationView: Array<{ [key: string]: any }>) => void
}

export default function UserView(props: EditViewProps) {
    const [searchString, setSearchString] = useState<string>('')

    const getSearchResults = async () => {
        const result = await api.searchEntry({
            searchString: searchString
        }) as any[];
        props.setSearchResults(result.map(row => ({
            id: row[0],
            name: row[1],
            host_id: row[2],
            host_name: row[3],
            neighbourhood: row[4],
            room_type: row[5],
            price: row[6],
            availability: row[7]
        })))
        //console.log(result)
        //props.setSearchResults()
    }

    return (
        <div className="relation-edition column">
            <div className="row">
                <input type="text" value={searchString} onChange={(e) => setSearchString(e.target.value)} />
                <button onClick={getSearchResults}>Search</button>
            </div>
            <TableView relationView={props.relationView} />
        </div>)
}