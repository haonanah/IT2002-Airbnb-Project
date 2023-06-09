import { useState } from "react"
import { RelationView } from "../pages/Admin"
import TableView from "./TableView"
import * as api from '../api'

interface EditViewProps {
    // ? Takes RelationView from the parent to interactively modify
    relationView: RelationView;
    setSearchResults: (relationView: Array<{ [key: string]: any }>) => void
    onRelationChange: (relationView: RelationView) => void
}

export default function UserView(props: EditViewProps) {
    const [searchString, setSearchString] = useState<string>('')
    const [priceFilter, setPriceFilter] = useState<string>('')

    const getSearchResults = async () => { //calls searchEntry from api to match serach string before mapping it the the respetive columns before passing into setserachresult function
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
    async function getFilteredTable() {//reterieve filtered rows from a table by calling api.filterTable given priceFilter value
        const result = await api.filterTable({
            price: parseInt(priceFilter)
        }) as any[];
        props.onRelationChange({
            columns: props.relationView.columns,
            rows: result.map(row => ({
                id: row[0],
                name: row[1],
                host_id: row[2],
                host_name: row[3],
                neighbourhood: row[4],
                room_type: row[5],
                price: row[6],
                availability: row[7]
            }))
        })

    }
    return (
        <div className="relation-edition column">
            <div className="row">
                <p>Search for Neighbourhood or Room Type here:</p>
                <input type="text" value={searchString} onChange={(e) => setSearchString(e.target.value)} />
                <button onClick={getSearchResults}>Search</button>
            </div>

            <div className="column" style={{ margin: 20 }}>
                <p>Filter by price here (&#60;)</p>
                <div className="row">
                    <input type="text" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} />
                    <button onClick={getFilteredTable}>Search</button>
                </div>
            </div>

            <TableView relationView={props.relationView} />
        </div>)
}